"use client";

import React from "react";

/**
 * Renderizador Markdown ligero para las respuestas del modelo.
 * Cubre lo que realmente devuelve el generador: encabezados, negritas,
 * listas, bloques de código, código inline y enlaces. Sin dependencias.
 */

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // negritas **x**, código inline `x`, enlaces [t](u)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="px-1 py-0.5 rounded bg-muted text-[0.85em] font-mono text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const m = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) {
        nodes.push(
          <a
            key={key}
            href={m[2]}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {m[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];

  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bloque de código ``` (admite lang en la misma línea y fences consecutivos)
    if (line.trim().startsWith("```")) {
      const fenceLang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      // Si la misma línea trae contenido tras el fence, se trata como primera línea de código
      const inlineRest = line.trim().slice(3).trim();
      if (inlineRest && !/^[a-zA-Z0-9+#-]{1,15}$/.test(inlineRest)) {
        codeLines.push(inlineRest);
      }
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consumir el fence de cierre
      blocks.push(
        <pre
          key={`pre-${key++}`}
          className="my-3 rounded-xl border border-border/60 bg-muted/50 p-3 overflow-x-auto"
        >
          {fenceLang && /^[a-zA-Z0-9+#-]{1,15}$/.test(fenceLang) && (
            <span className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
              {fenceLang}
            </span>
          )}
          <code className="text-[0.8em] font-mono whitespace-pre-wrap break-words text-foreground">
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      continue;
    }

    // Encabezados
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const content = renderInline(h[2], `h${key}`);
      const cls =
        level <= 2
          ? "text-sm font-bold mt-4 mb-2 text-foreground"
          : "text-[13px] font-semibold mt-3 mb-1.5 text-foreground";
      blocks.push(
        <div key={`h-${key++}`} className={cls}>
          {content}
        </div>
      );
      i++;
      continue;
    }

    // Listas
    if (/^\s*[-*•]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      const ordered = /^\s*\d+\.\s+/.test(line);
      while (
        i < lines.length &&
        (/^\s*[-*•]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))
      ) {
        items.push(lines[i].replace(/^\s*([-*•]|\d+\.)\s+/, ""));
        i++;
      }
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={`l-${key++}`}
          className={`my-2 space-y-1 pl-4 text-foreground/90 ${
            ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {items.map((it, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(it, `li${idx}`)}
            </li>
          ))}
        </ListTag>
      );
      continue;
    }

    // Línea en blanco
    if (line.trim() === "") {
      blocks.push(<div key={`sp-${key++}`} className="h-2" />);
      i++;
      continue;
    }

    // Párrafo
    blocks.push(
      <p key={`p-${key++}`} className="leading-relaxed text-foreground/90">
        {renderInline(line, `p${key}`)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{blocks}</div>;
}
