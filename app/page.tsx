"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "../components/chat-interface";
import { ContextSidebar } from "../components/context-sidebar";
import { ModelSelector } from "../components/model-selector";
import { Button } from "../components/ui/button";
import { Moon, Sun, Sparkles, BookOpen } from "lucide-react";
import { DEFAULT_MODEL } from "../lib/openrouter";
import { PromptBuilder } from "../components/prompt-builder";

export default function Home() {
  const [context, setContext] = useState({
    domain: "",
    customText: "",
    repoUrl: "",
    repoFiles: [] as string[],
  });
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  const handleLoadRepo = async () => {
    if (!context.repoUrl) return;
    setIsRepoLoading(true);
    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: context.repoUrl }),
      });
      const data = await response.json();
      if (data.success) {
        setContext((prev) => ({
          ...prev,
          repoFiles: data.data.files.map((f: any) => f.path),
        }));
      }
    } catch (error) {
      console.error("Error cargando repo:", error);
    } finally {
      setIsRepoLoading(false);
    }
  };

  const repoName = context.repoUrl
    ? context.repoUrl.split("/").slice(-2).join("/")
    : undefined;

  return (
    <div
      className="h-screen overflow-hidden bg-background text-foreground app-bg"
      style={{ backgroundAttachment: "fixed" }}
    >
      <div className="flex flex-col h-full">
        <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
          <div className="flex items-center justify-between px-4 md:px-6 h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent truncate">
                  Prompt Profesionales
                </h1>
                <p className="hidden sm:block text-[11px] text-muted-foreground -mt-0.5">
                  Generador inteligente de prompts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <a
                href="/ayuda"
                className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Ayuda
              </a>
              <div className="hidden sm:block">
                <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="rounded-lg"
                aria-label="Cambiar tema"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-80 xl:w-96 hidden md:block shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-sm">
            <ContextSidebar
              context={context}
              onContextChange={setContext}
              onLoadRepo={handleLoadRepo}
              isRepoLoading={isRepoLoading}
            />
          </aside>

          <main className="flex-1 min-w-0 flex flex-col bg-background/40 overflow-hidden">
            <div className="shrink-0 max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-border/40"><div className="mx-auto w-full max-w-3xl px-4 md:px-6 pt-4 pb-3"><PromptBuilder onGenerate={(text) => window.dispatchEvent(new CustomEvent("prompt-builder-generate", { detail: text }))} /></div></div>
            <div className="min-h-0 flex-1 overflow-hidden"><ChatInterface
              model={selectedModel}
              context={{
                domain: context.domain,
                customText: context.customText,
                repoName,
                files: context.repoFiles,
                image: context.uploadedImage,
              }}
            /></div>
          </main>
        </div>
      </div>
    </div>
  );
}
