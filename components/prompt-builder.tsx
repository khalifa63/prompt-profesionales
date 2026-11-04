"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Wand2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { EMPTY_PROMPT_BUILDER, PROMPT_BUILDER_STEPS, buildPromptDraft, scorePromptDraft, type PromptBuilderState } from "../lib/prompt-builder";

const STORAGE_KEY = "prompt-profesionales:last-by-category";

const TEMPLATES: Array<{ label: string; values: Partial<PromptBuilderState> }> = [
  { label: "Marketing", values: { role: "Estratega senior de marketing digital", audience: "Responsables de marketing", outputFormat: "Tabla con estrategia, canal, mensaje y KPI" } },
  { label: "Código", values: { role: "Ingeniero de software senior", audience: "Equipo técnico", outputFormat: "Plan paso a paso con código TypeScript y pruebas" } },
  { label: "Investigación", values: { role: "Analista de investigación riguroso", audience: "Profesionales que necesitan evidencia verificable", outputFormat: "Informe con resumen, hallazgos, fuentes y limitaciones" } },
  { label: "Educación", values: { role: "Docente experto en diseño instruccional", audience: "Estudiantes del nivel indicado", outputFormat: "Explicación por niveles, ejemplos y ejercicios" } },
  { label: "Viajes", values: { objective: "Crear un itinerario de viaje personalizado con actividades, tiempos, presupuesto y recomendaciones prácticas", role: "Planificador de viajes experto en turismo responsable", audience: "Viajeros que buscan un plan claro y adaptable", context: "Destino: [DESTINO]. Fechas: [FECHAS]. Presupuesto: [PRESUPUESTO]. Preferencias: [PREFERENCIAS].", instructions: "Propón un itinerario diario equilibrando visitas, descanso, transporte y gastronomía. Indica alternativas y advierte sobre datos que deban verificarse.", outputFormat: "Tabla por día con horarios aproximados, actividad, ubicación, coste estimado y consejos", qualityCriteria: "El plan debe ser realista, ordenado, seguro y ajustado al presupuesto.", constraints: "No inventes horarios, precios ni disponibilidad. Marca como [VERIFICAR] cualquier dato actualizado.", examples: "Incluye una opción económica y otra de mayor comodidad." } },
  { label: "Diseño", values: { objective: "Crear una propuesta de diseño visual clara, atractiva y coherente con los objetivos del proyecto", role: "Director de diseño senior especializado en experiencia de usuario y comunicación visual", audience: "Cliente, equipo de diseño y responsables del proyecto", context: "Proyecto: [PROYECTO]. Marca: [MARCA]. Público: [PÚBLICO]. Plataforma: [PLATAFORMA].", instructions: "Analiza el objetivo, propone una dirección visual, define jerarquía, paleta, tipografías, componentes y criterios de accesibilidad. Explica las decisiones y ofrece alternativas.", outputFormat: "Brief de diseño con concepto, referencias, paleta HEX, tipografías, componentes, layout, estados y checklist de entrega", qualityCriteria: "La propuesta debe ser usable, accesible, consistente, justificable y adaptable a distintos tamaños.", constraints: "No inventes recursos de marca. Marca como [DEFINIR] la información faltante y evita copiar diseños protegidos.", examples: "Incluye una alternativa minimalista y otra más expresiva." } },
  { label: "Compras", values: { objective: "Comparar opciones de compra y recomendar la alternativa con mejor relación entre precio, calidad, utilidad y riesgo", role: "Asesor de compras responsable y analista de productos", audience: "Una persona que necesita tomar una decisión de compra informada", context: "Producto o servicio: [PRODUCTO]. Presupuesto: [PRESUPUESTO]. País o ciudad: [UBICACIÓN]. Necesidad principal: [NECESIDAD]. Preferencias: [PREFERENCIAS].", instructions: "Define los criterios de evaluación, compara alternativas disponibles, separa hechos de opiniones, identifica costes adicionales y señala qué datos deben verificarse antes de comprar.", outputFormat: "Tabla comparativa con opción, precio, características, ventajas, desventajas, costes adicionales y recomendación final", qualityCriteria: "La recomendación debe ser objetiva, transparente, ajustada al presupuesto y basada en información verificable.", constraints: "No inventes precios, disponibilidad, reseñas ni garantías. Marca como [VERIFICAR] los datos que cambien con el tiempo y no presentes publicidad como evidencia.", examples: "Incluye una opción económica, una equilibrada y una premium." } },
];

interface Props { onGenerate: (text: string) => void; }

export function PromptBuilder({ onGenerate }: Props) {
  const [state, setState] = useState<PromptBuilderState>(EMPTY_PROMPT_BUILDER);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("General");
  const current = PROMPT_BUILDER_STEPS[step];
  const score = useMemo(() => scorePromptDraft(state), [state]);
  const draft = useMemo(() => buildPromptDraft(state), [state]);

  const persistCurrent = (nextState: PromptBuilderState = state) => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      saved[category] = { state: nextState, draft: buildPromptDraft(nextState), updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch { /* almacenamiento local no disponible */ }
  };
  const update = (key: keyof PromptBuilderState, value: string) => setState((prev) => {
    const next = { ...prev, [key]: value };
    persistCurrent(next);
    return next;
  });
  const applyTemplate = (values: Partial<PromptBuilderState>, label: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      saved[category] = { state, draft, updatedAt: new Date().toISOString() };
      const stored = saved[label]?.state;
      const nextState = stored ? { ...EMPTY_PROMPT_BUILDER, ...stored } : { ...EMPTY_PROMPT_BUILDER };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setState(nextState);
      setCategory(label);
      setStep(0);
    } catch {
      setState({ ...EMPTY_PROMPT_BUILDER });
      setCategory(label);
      setStep(0);
    }
  };
  const clear = () => { setState(EMPTY_PROMPT_BUILDER); setStep(0); };

  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-4 shadow-sm min-h-fit">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Constructor guiado</p><h3 className="text-base font-semibold">Diseña un prompt profesional</h3></div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">Calidad {score}/10</span>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1 pb-2">{TEMPLATES.map((template) => <button key={template.label} type="button" aria-pressed={category === template.label} onClick={() => applyTemplate(template.values, template.label)} className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${category === template.label ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border hover:border-primary/50 hover:bg-primary/5"}`}>{category === template.label ? "✓ " : ""}{template.label}</button>)}</div>
      <div className="text-[10px] text-muted-foreground">Contexto activo · última interacción guardada: <span className="font-medium text-foreground">{category}</span></div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="font-medium text-foreground">{step + 1}/{PROMPT_BUILDER_STEPS.length}</span><span>{current.title}</span><div className="h-1 flex-1 rounded-full bg-muted"><div className="h-1 rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / PROMPT_BUILDER_STEPS.length) * 100}%` }} /></div></div>
      <div className="space-y-2"><label className="text-xs font-medium">{current.title}</label><p className="text-[11px] text-muted-foreground">{current.hint}</p>{current.key === "role" ? <div className="grid gap-2"><Input value={state.role} onChange={(e) => update("role", e.target.value)} placeholder="Ej. Analista financiero senior" /><Input value={state.audience} onChange={(e) => update("audience", e.target.value)} placeholder="Audiencia o usuario final" /></div> : <Textarea value={state[current.key]} onChange={(e) => update(current.key, e.target.value)} placeholder="Escribe aquí los detalles..." className="min-h-24 resize-y" />}</div>
      <div className="flex justify-between gap-2 pt-3 mt-2 border-t border-border/40"><Button type="button" variant="ghost" size="sm" onClick={clear}><RotateCcw className="mr-1 h-3.5 w-3.5" />Limpiar</Button><div className="flex gap-2">{step > 0 && <Button type="button" variant="outline" size="sm" onClick={() => setStep(step - 1)}><ChevronLeft className="mr-1 h-3.5 w-3.5" />Atrás</Button>}{step < PROMPT_BUILDER_STEPS.length - 1 ? <Button type="button" size="sm" onClick={() => setStep(step + 1)}>Siguiente<ChevronRight className="ml-1 h-3.5 w-3.5" /></Button> : <Button type="button" size="sm" onClick={() => onGenerate(draft)} disabled={!state.objective.trim()}><Wand2 className="mr-1 h-3.5 w-3.5" />Generar</Button>}</div></div>
      {draft && <div className="rounded-lg bg-muted/50 p-2 text-[10px] text-muted-foreground"><Check className="mr-1 inline h-3 w-3 text-emerald-500" />Borrador preparado; puedes revisarlo antes de generar.</div>}
    </section>
  );
}
