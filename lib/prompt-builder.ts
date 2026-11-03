export interface PromptBuilderState {
  objective: string;
  role: string;
  audience: string;
  context: string;
  instructions: string;
  outputFormat: string;
  qualityCriteria: string;
  constraints: string;
  examples: string;
}

export const EMPTY_PROMPT_BUILDER: PromptBuilderState = {
  objective: "",
  role: "",
  audience: "",
  context: "",
  instructions: "",
  outputFormat: "",
  qualityCriteria: "",
  constraints: "",
  examples: "",
};

export const PROMPT_BUILDER_STEPS = [
  { key: "objective", title: "Objetivo", hint: "¿Qué resultado concreto debe conseguir el modelo?" },
  { key: "role", title: "Rol y audiencia", hint: "Define quién responde y para quién trabaja." },
  { key: "context", title: "Contexto", hint: "Añade datos, antecedentes o fuentes de verdad." },
  { key: "instructions", title: "Instrucciones", hint: "Indica los pasos que debe seguir." },
  { key: "outputFormat", title: "Formato", hint: "Especifica la estructura exacta de la respuesta." },
  { key: "qualityCriteria", title: "Calidad y límites", hint: "Define cómo evaluar el resultado y qué evitar." },
] as const;

export function buildPromptDraft(state: PromptBuilderState): string {
  const section = (title: string, value: string) => value.trim() ? `## ${title}\n${value.trim()}` : "";
  return [
    section("Rol", state.role || "Actúa como un especialista experto en el tema solicitado."),
    section("Objetivo", state.objective),
    section("Audiencia", state.audience),
    section("Contexto", state.context),
    section("Instrucciones", state.instructions),
    section("Formato de salida", state.outputFormat),
    section("Criterios de calidad", state.qualityCriteria),
    section("Restricciones", state.constraints),
    section("Ejemplos", state.examples),
  ].filter(Boolean).join("\n\n");
}

export function scorePromptDraft(state: PromptBuilderState): number {
  const checks = [state.objective, state.role, state.context, state.instructions, state.outputFormat, state.qualityCriteria, state.constraints, state.audience];
  return Math.round((checks.filter((value) => value.trim().length > 0).length / checks.length) * 10);
}
