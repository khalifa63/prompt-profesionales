import { NextRequest, NextResponse } from "next/server";
import {
  AVAILABLE_MODELS,
  DEFAULT_MODEL,
  buildRefineSystemPrompt,
  buildSystemPrompt,
  getClient,
  isValidModel,
  type ChatMessage,
  type PromptContext,
} from "../../../lib/openrouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INPUT_CHARS = 6000;
const MAX_TOTAL_MESSAGES = 24;

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m as any).role !== "system" &&
        ["user", "assistant"].includes((m as any).role) &&
        typeof (m as any).content === "string"
    )
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_INPUT_CHARS),
    }))
    .slice(-MAX_TOTAL_MESSAGES);
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Cuerpo de la petición inválido (JSON malformado)." },
      { status: 400 }
    );
  }

  const messages = sanitizeMessages(body?.messages);
  if (messages.length === 0) {
    return NextResponse.json(
      { success: false, error: "Necesito al menos un mensaje de usuario." },
      { status: 400 }
    );
  }

  const model = isValidModel(body?.model) ? body.model : DEFAULT_MODEL;
  const context: PromptContext = {
    domain: typeof body?.context?.domain === "string" ? body.context.domain.slice(0, 400) : undefined,
    customText:
      typeof body?.context?.customText === "string" ? body.context.customText : undefined,
    repoName:
      typeof body?.context?.repoName === "string" ? body.context.repoName.slice(0, 200) : undefined,
    files: Array.isArray(body?.context?.files)
      ? body.context.files.filter((f: unknown) => typeof f === "string")
      : undefined,
  };

  const refine = body?.mode === "refine";
  const system = refine ? buildRefineSystemPrompt(context) : buildSystemPrompt(context);
  const wantsStream = body?.stream !== false;

  let client;
  try {
    client = getClient();
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }

  const params = {
    model,
    messages: [{ role: "system" as const, content: system }, ...messages],
    max_tokens: refine ? 2600 : 2000,
    temperature: refine ? 0.3 : 0.45,
    top_p: 0.9,
  };

  // --- Modo sin streaming ---
  if (!wantsStream) {
    try {
      const response = await client.chat.completions.create(params);
      return NextResponse.json({
        success: true,
        data: response.choices[0]?.message?.content ?? "",
        model,
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error?.message || "Error al contactar el modelo." },
        { status: 502 }
      );
    }
  }

  // --- Streaming SSE ---
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        const completion = await client.chat.completions.create({ ...params, stream: true });
        let full = "";
        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            send("delta", { text: delta });
          }
        }
        send("done", { text: full, model });
      } catch (error: any) {
        send("error", {
          message: error?.message || "Error durante la generación.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    models: AVAILABLE_MODELS,
    defaultModel: DEFAULT_MODEL,
  });
}
