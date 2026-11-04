"use client"

import { BookOpen, FileText, Loader2, Sparkles, Upload, X } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card } from "./ui/card"

interface ContextSidebarProps {
  context: { domain: string; customText: string; repoUrl: string; repoFiles: string[] }
  onContextChange: (newContext: any) => void
  onLoadRepo: () => Promise<void>
  isRepoLoading: boolean
}

export function ContextSidebar({
  context,
  onContextChange,
  onLoadRepo,
  isRepoLoading,
}: ContextSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border/60">
        <h2 className="text-sm font-semibold flex items-center gap-2 tracking-tight">
          <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4" />
          </span>
          Base de Conocimiento
        </h2>
        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
          Define el contexto para mejorar la precisión de los prompts generados.
        </p>
      </div>

      <Tabs defaultValue="domain" className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 pb-0">
          <TabsList className="grid w-full grid-cols-2 h-9 rounded-lg">
            <TabsTrigger value="domain" className="text-xs rounded-md">
              Dominio / Texto
            </TabsTrigger>
            <TabsTrigger value="github" className="text-xs rounded-md">
              GitHub
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="domain" className="flex-1 p-4 space-y-5 overflow-y-auto mt-0">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/80">Área de Conocimiento</label>
            <Input
              placeholder="Ej: Derecho, Electrónica, Finanzas…"
              value={context.domain}
              onChange={(e) => onContextChange({ ...context, domain: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/80">Archivos de contexto</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-3 text-xs hover:bg-primary/10">
              <Upload className="h-4 w-4 text-primary" /> Subir texto, PDF o imagen
              <input type="file" accept=".txt,.md,.csv,.json,.js,.ts,.tsx,.py,.pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tif,.tiff,.svg,.avif,text/plain,application/pdf,image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { alert("El archivo supera el límite de 5 MB."); return; }
                const form = new FormData(); form.append("file", file);
                try {
                  const response = await fetch("/api/files", { method: "POST", body: form });
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || "No se pudo leer el archivo.");
                  if (data.type === "image") {
                    onContextChange({ ...context, uploadedFile: data.name, uploadedImage: { name: data.name, mime: data.mime, dataUrl: data.dataUrl } });
                  } else {
                    onContextChange({ ...context, customText: `${context.customText}${context.customText ? "\n\n" : ""}[Archivo: ${data.name}]\n${data.text}`, uploadedFile: data.name });
                  }
                } catch (error: any) { alert(error?.message || "No se pudo leer el archivo."); }
                e.currentTarget.value = "";
              }} />
            </label>
            {context.uploadedImage?.dataUrl && <img src={context.uploadedImage.dataUrl} alt={context.uploadedImage.name} className="max-h-32 w-full rounded-md object-contain bg-muted/40" />}
            {context.uploadedFile && <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-[10px]"><span className="truncate">{context.uploadedFile}</span><button type="button" onClick={() => onContextChange({ ...context, uploadedFile: "" })} aria-label="Quitar archivo"><X className="h-3 w-3" /></button></div>}
            <p className="text-[10px] text-muted-foreground">Máximo 5 MB. El contenido se procesa temporalmente y se añade al contexto.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/80">Contexto Adicional</label>
            <Textarea
              placeholder="Pega aquí normativas, especificaciones técnicas, estilo deseado…"
              className="min-h-[220px] resize-none text-sm leading-relaxed"
              value={context.customText}
              onChange={(e) => onContextChange({ ...context, customText: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Cuanto más contexto aportes, más preciso será el prompt resultante.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="github" className="flex-1 p-4 space-y-5 overflow-y-auto mt-0">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/80">URL del Repositorio</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/usuario/repo"
                value={context.repoUrl}
                onChange={(e) => onContextChange({ ...context, repoUrl: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    onLoadRepo()
                  }
                }}
              />
              <Button
                onClick={onLoadRepo}
                disabled={isRepoLoading || !context.repoUrl}
                size="icon"
                className="shrink-0 rounded-lg"
                title="Cargar repositorio"
              >
                {isRepoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GithubIcon />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Opcional. Se listarán los archivos relevantes como contexto adicional.
            </p>
          </div>

          {context.repoFiles.length > 0 && (
            <Card className="p-3 bg-muted/40 border-border/60">
              <p className="text-[11px] font-semibold mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Archivos detectados
                <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                  {context.repoFiles.length}
                </span>
              </p>
              <ul className="text-[11px] text-muted-foreground space-y-1 max-h-[260px] overflow-y-auto font-mono">
                {context.repoFiles.map((file, i) => (
                  <li key={i} className="truncate" title={file}>
                    {file}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-border/60">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-[11px] flex items-start gap-2 leading-relaxed text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span>
              El contexto se aplica a <strong className="text-foreground">todas</strong> las
              generaciones de esta sesión.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

function GithubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}