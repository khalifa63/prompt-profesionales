"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Copy,
  Check,
  Loader2,
  Bot,
  User as UserIcon,
  Sparkles,
  Square,
  Wand2,
  Download,
  RotateCcw,
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { streamGeneration } from "../lib/stream-client";
import { MarkdownLite } from "./markdown-lite";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  error?: boolean;
  mode?: "generate" | "refine";
}

interface ChatInterfaceProps {
  model: string;
  context: {
    domain: string;
    customText: string;
    repoName?: string;
    files?: string[];
  };
}

const SUGGESTIONS = [
  {
    label: "Análisis financiero",
    text: "Un prompt para analizar estados financieros trimestrales y detectar riesgos de liquidez",
  },
  {
    label: "Refactor de código",
    text: "Un prompt para refactorizar código legacy hacia TypeScript sin romper la API pública",
  },
  {
    label: "Redacción legal",
    text: "Un prompt para redactar una demanda civil por incumplimiento de contrato",
  },
];

export function ChatInterface({ model, context }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    const handler = (event: Event) => {
      const text = (event as CustomEvent<string>).detail;
      if (text) { setInput(text); textareaRef.current?.focus(); }
    };
    window.addEventListener("prompt-builder-generate", handler);
    return () => window.removeEventListener("prompt-builder-generate", handler);
  }, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const run = useCallback(
    (history: Message[], mode: "generate" | "refine") => {
      const assistantId = `a-${Date.now()}`;
      setBusy(true);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", streaming: true, mode },
      ]);

      const payloadMessages = history
        .filter((m) => !m.error && m.content.trim())
        .map((m) => ({ role: m.role, content: m.content }));

      abortRef.current = streamGeneration(
        { messages: payloadMessages, model, context, mode },
        {
          onDelta: (text) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + text } : m
              )
            );
          },
          onDone: (full) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: full || m.content, streaming: false }
                  : m
              )
            );
            setBusy(false);
          },
          onError: (message) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: m.content
                        ? m.content + `\n\n⚠️ ${message}`
                        : `⚠️ ${message}`,
                      streaming: false,
                      error: !m.content,
                    }
                  : m
              )
            );
            setBusy(false);
          },
        }
      );
    },
    [model, context]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    run(next, "generate");
  };

  const handleRefine = (msg: Message) => {
    if (busy) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: `Refina y mejora este prompt:\n\n${msg.content}`,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    run(next, "refine");
  };

  const stop = () => {
    abortRef.current?.abort();
    setBusy(false);
    setMessages((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m))
    );
  };

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const download = (text: string) => {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (busy) return;
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center min-h-[52vh] gap-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-indigo-500/25">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h2 className="text-2xl font-bold tracking-tight">
                  ¿Qué prompt necesitas hoy?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Describe tu necesidad en lenguaje natural. Generaré un prompt
                  estructurado con rol, objetivo, instrucciones, formato de salida y
                  criterios de calidad.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-2xl">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setInput(s.text);
                      textareaRef.current?.focus();
                    }}
                    className="group text-left rounded-xl border border-border/60 bg-card/60 hover:bg-accent hover:border-primary/40 transition-all p-3"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary mb-1">
                      <Sparkles className="h-3 w-3" />
                      {s.label}
                    </span>
                    <span className="block text-xs leading-relaxed text-foreground/80 group-hover:text-foreground">
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="animate-fade-up">
              <div
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
                  }`}
                >
                  {msg.role === "user" ? (
                    <UserIcon className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0 max-w-[85%]">
                  {msg.role === "assistant" && msg.mode === "refine" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary mb-1">
                      <Wand2 className="h-3 w-3" /> Refinamiento
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : msg.error
                        ? "bg-destructive/10 border border-destructive/30 text-foreground rounded-tl-sm"
                        : "bg-card border border-border/60 shadow-sm rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" && !msg.streaming && !msg.error ? (
                      <MarkdownLite text={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content}
                        {msg.streaming && (
                          <span className="inline-block w-1.5 h-4 ml-0.5 align-text-bottom bg-primary/70 animate-pulse rounded-sm" />
                        )}
                        {msg.streaming && !msg.content && (
                          <span className="inline-flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Generando prompt…
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.role === "assistant" && !msg.streaming && !msg.error && msg.content && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copy(msg.content, msg.id)}
                        className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                        title="Copiar prompt"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRefine(msg)}
                        disabled={busy}
                        className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                        title="Mejorar este prompt"
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => download(msg.content)}
                        className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                        title="Descargar .md"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[10px] text-muted-foreground ml-1">
                        {copiedId === msg.id
                          ? "Copiado"
                          : msg.mode === "refine"
                          ? "Prompt refinado"
                          : "Copiar · Mejorar · Descargar"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/70 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl px-4 md:px-6 py-4">
          <div className="relative rounded-2xl border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring/40 focus-within:border-primary/50 transition-all">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe tu necesidad y generaré un prompt optimizado…"
              className="min-h-[64px] max-h-40 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-14 py-3.5 text-sm shadow-none"
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              {messages.length > 0 && !busy && (
                <button
                  type="button"
                  onClick={reset}
                  title="Nueva conversación"
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              {busy ? (
                <Button
                  type="button"
                  size="icon"
                  onClick={stop}
                  className="h-9 w-9 rounded-xl"
                  title="Detener"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="h-9 w-9 rounded-xl shadow-md shadow-primary/25 transition-transform active:scale-95"
                  aria-label="Enviar"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-center text-muted-foreground">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-medium">
              Enter
            </kbd>{" "}
            enviar ·{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-medium">
              Shift + Enter
            </kbd>{" "}
            salto de línea ·{" "}
            <a href="/ayuda" className="underline hover:text-foreground">
              Guía de uso
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
