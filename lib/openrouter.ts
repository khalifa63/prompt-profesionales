import OpenAI from "openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PromptContext {
  domain?: string;
  customText?: string;
  repoName?: string;
  files?: string[];
}

/** Modelos verificados contra OpenRouter (2026-10). Los antiguos daban 404. */
export const AVAILABLE_MODELS = [
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    description: "Modelo open-source grande; alta calidad en free tier",
    badge: "Free",
  },
  {
    id: "mistralai/mistral-7b-instruct",
    name: "Mistral 7B",
    description: "Rapido y economico; opcion free tier",
    badge: "Free",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "Equilibrio optimo calidad/velocidad",
    badge: "Recomendado",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Contexto muy largo y razonamiento",
    badge: "Contexto",
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek Chat",
    description: "Económico para iteraciones",
    badge: "Económico",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    description: "Rápido y de bajo coste",
    badge: "Rápido",
  },
] as const;

export const DEFAULT_MODEL = "deepseek/deepseek-chat"; // Modelo disponible y económico

/** Límite de seguridad para evitar reventar la ventana de contexto. */
export const MAX_CONTEXT_CHARS = 8000;
export const MAX_FILES_IN_CONTEXT = 40;

export function getClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta OPENROUTER_API_KEY o OPENAI_API_KEY en el entorno del servidor."
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_API_KEY
      ? "https://openrouter.ai/api/v1"
      : undefined,
  });
}

export function isValidModel(model?: string): boolean {
  if (!model) return false;
  return AVAILABLE_MODELS.some((m) => m.id === model);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return (
    text.slice(0, max) +
    `\n\n[…texto truncado: se recortaron ${text.length - max} caracteres para respetar el límite de contexto]`
  );
}

/**
 * System prompt del generador. Estructura la salida en secciones fijas y
 * declara explícitamente los criterios de calidad que el modelo debe cumplir.
 */
export function buildSystemPrompt(context: PromptContext = {}): string {
  const parts: string[] = [];

  parts.push(
    `Eres un ingeniero de prompts senior. Tu única tarea es producir prompts profesionales, listos para pegar en un modelo de lenguaje, que resuelvan la necesidad que describe el usuario.

NO ejecutes la tarea del usuario. NO respondas a la petición como si fueras el asistente final. Escribe el prompt que otra persona usaría para obtener ese resultado.`
  );

  parts.push(
    `Todo prompt que generes debe incluir, en este orden y con encabezados claros:
1. **Rol** — quién debe ser el modelo, con nivel de experiencia concreto.
2. **Objetivo** — el resultado exacto que se espera, en una frase medible.
3. **Contexto** — datos, restricciones y supuestos relevantes.
4. **Instrucciones** — pasos numerados y accionables.
5. **Formato de salida** — estructura exacta (Markdown, JSON, tabla, longitud).
6. **Criterios de calidad** — cómo se juzgará si la respuesta es buena.
7. **Restricciones** — qué NO hacer, límites y salvaguardas.
8. **Ejemplos** — solo si aportan claridad (few-shot).`
  );

  parts.push(
    `Criterios de calidad obligatorios:
- Sé específico: elimina adjetivos vacíos ("bueno", "profesional") y sustitúyelos por criterios observables.
- Declara el formato de salida de forma inequívoca.
- Incluye al menos una restricción explícita que prevenga el error más probable.
- No inventes datos del usuario: si falta información crítica, escribe un marcador como [COMPLETAR: …].
- Redacta el prompt en el mismo idioma que usó el usuario.`
  );

  if (context.domain?.trim()) {
    parts.push(
      `ÁREA DE ESPECIALIZACIÓN: ${context.domain.trim()}.
Adapta terminología, estándares y buenas prácticas de ese campo. Usa el vocabulario técnico propio de la disciplina.`
    );
  }

  if (context.customText?.trim()) {
    parts.push(
      `CONTEXTO APORTADO POR EL USUARIO (úsalo como fuente de verdad):
"""
${truncate(context.customText.trim(), MAX_CONTEXT_CHARS)}
"""`
    );
  }

  if (context.repoName) {
    const files = (context.files ?? []).slice(0, MAX_FILES_IN_CONTEXT);
    const extra =
      (context.files?.length ?? 0) > MAX_FILES_IN_CONTEXT
        ? `, y ${(context.files?.length ?? 0) - MAX_FILES_IN_CONTEXT} más`
        : "";
    parts.push(
      `CONTEXTO DE REPOSITORIO: ${context.repoName}.
Archivos relevantes: ${files.join(", ")}${extra}.
Si el prompt implica trabajo sobre este código, alinéalo con su stack y su estructura.`
    );
  }

  return parts.join("\n\n");
}

/**
 * System prompt del refinador: evalúa un prompt existente contra una rúbrica
 * y devuelve la versión corregida más una lista de mejoras aplicadas.
 */
export function buildRefineSystemPrompt(context: PromptContext = {}): string {
  const base = buildSystemPrompt(context);
  return `${base}

MODO REFINAMIENTO. Recibirás un prompt ya escrito. Tu trabajo:
1. Evalúalo contra la rúbrica: rol, objetivo medible, contexto, instrucciones, formato de salida, criterios de calidad, restricciones, ejemplos.
2. Identifica las carencias concretas.
3. Reescribe el prompt corrigiéndolas sin cambiar la intención original.

Devuelve EXACTAMENTE este formato Markdown, sin texto antes ni después:

## Diagnóstico
- (3 a 6 viñetas con las carencias detectadas, ordenadas por impacto)

## Prompt mejorado
\`\`\`
(el prompt reescrito, completo y listo para usar)
\`\`\`

## Cambios aplicados
- (viñetas: qué se añadió o cambió y por qué)

## Puntuación
Antes: N/10 — Después: M/10`;
}
