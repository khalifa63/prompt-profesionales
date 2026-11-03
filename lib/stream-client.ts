export interface StreamHandlers {
  onDelta: (text: string) => void;
  onDone: (full: string) => void;
  onError: (message: string) => void;
}

export interface GeneratePayload {
  messages: { role: "user" | "assistant"; content: string }[];
  model: string;
  context: {
    domain?: string;
    customText?: string;
    repoName?: string;
    files?: string[];
  };
  mode?: "generate" | "refine";
}

/**
 * Consume el endpoint SSE de /api/chat.
 * Devuelve un AbortController para poder cancelar la generación en curso.
 */
export function streamGeneration(
  payload: GeneratePayload,
  handlers: StreamHandlers
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let msg = `Error ${res.status}`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {
          /* ignore */
        }
        handlers.onError(msg);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      let finished = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          const eventLine = block.split("\n").find((l) => l.startsWith("event:"));
          const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.slice(6).trim();
          let data: any;
          try {
            data = JSON.parse(dataLine.slice(5).trim());
          } catch {
            continue;
          }

          if (event === "delta" && typeof data.text === "string") {
            full += data.text;
            handlers.onDelta(data.text);
          } else if (event === "done") {
            finished = true;
            handlers.onDone(typeof data.text === "string" ? data.text : full);
          } else if (event === "error") {
            finished = true;
            handlers.onError(data.message || "Error durante la generación.");
          }
        }
      }

      if (!finished) handlers.onDone(full);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      handlers.onError(err?.message || "Error de red al generar el prompt.");
    }
  })();

  return controller;
}
