import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Wand2,
  Copy,
  Download,
  ShieldCheck,
  Layers,
  Lightbulb,
  ListChecks,
  AlertTriangle,
  Gauge,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cómo usar Prompt Profesionales — Guía completa",
  description:
    "Guía de uso de Prompt Profesionales: cómo escribir una petición, qué contiene un prompt optimizado, cómo usar contexto y GitHub, y buenas prácticas.",
};

const ANATOMY = [
  {
    n: "1",
    title: "Rol",
    desc: "Quién debe ser el modelo y con qué nivel de experiencia. Ejemplo: «Actúa como analista de riesgo con 10 años en banca minorista».",
  },
  {
    n: "2",
    title: "Objetivo",
    desc: "El resultado exacto esperado, en una frase medible. Evita verbos difusos como «mejorar» sin criterio.",
  },
  {
    n: "3",
    title: "Contexto",
    desc: "Datos, supuestos y restricciones que el modelo necesita conocer para no improvisar.",
  },
  {
    n: "4",
    title: "Instrucciones",
    desc: "Pasos numerados y accionables, en el orden en que deben ejecutarse.",
  },
  {
    n: "5",
    title: "Formato de salida",
    desc: "Estructura inequívoca: Markdown, tabla, JSON con un esquema concreto, o número de palabras.",
  },
  {
    n: "6",
    title: "Criterios de calidad",
    desc: "Cómo se juzgará si la respuesta es buena. Esto es lo que más eleva la calidad final.",
  },
  {
    n: "7",
    title: "Restricciones",
    desc: "Qué NO hacer y las salvaguardas que evitan el error más probable.",
  },
  {
    n: "8",
    title: "Ejemplos",
    desc: "Opcional. Uno o dos ejemplos few-shot cuando el formato es difícil de describir con palabras.",
  },
];

const STEPS = [
  {
    icon: Sparkles,
    title: "1. Describe tu necesidad",
    body: "Escribe en lenguaje natural qué quieres conseguir. No hace falta que redactes un prompt: la app lo construye por ti.",
    tip: "Sé concreto sobre el resultado esperado. «Un prompt para revisar contratos de arrendamiento y listar cláusulas abusivas» funciona mucho mejor que «un prompt para abogados».",
  },
  {
    icon: Layers,
    title: "2. Añade contexto (opcional)",
    body: "En el panel izquierdo puedes indicar el ámbito de conocimiento y pegar normativa, especificaciones o cualquier material de referencia.",
    tip: "El texto pegado se inyecta en el prompt final. Hay un límite de ~8.000 caracteres por seguridad; lo que exceda se recorta y se avisa.",
  },
  {
    icon: BookOpen,
    title: "3. Conecta un repositorio (opcional)",
    body: "Pega la URL de un repositorio público de GitHub. La app listará los archivos relevantes para que el prompt se alinee con el stack real.",
    tip: "Útil para prompts de refactor, revisión de código o generación de tests sobre un proyecto concreto.",
  },
  {
    icon: Gauge,
    title: "4. Elige el modelo",
    body: "GPT-4o para calidad general, Gemini 2.5 Pro para contexto largo, DeepSeek o GPT-4o mini para iterar rápido y barato.",
    tip: "Si el resultado no te convence, prueba el mismo prompt con otro modelo antes de cambiar el texto.",
  },
  {
    icon: Wand2,
    title: "5. Refina el resultado",
    body: "Cada prompt generado tiene un botón «Mejorar». La app evalúa su propia salida contra una rúbrica y devuelve un diagnóstico, la versión corregida y la puntuación antes/después.",
    tip: "Usa el refinamiento cuando el prompt vaya a producción: es donde más sube la calidad.",
  },
  {
    icon: Copy,
    title: "6. Copia, descarga y usa",
    body: "Copia al portapapeles o descarga el prompt como archivo Markdown y pégalo en el modelo o herramienta que prefieras.",
    tip: "Los prompts se generan en el mismo idioma de tu petición.",
  },
];

const PRACTICES = [
  {
    ok: true,
    text: "Un objetivo por prompt. Si necesitas varias cosas, genera varios prompts.",
  },
  {
    ok: true,
    text: "Indica el formato exacto que quieres recibir, con un ejemplo si es complejo.",
  },
  {
    ok: true,
    text: "Menciona tu audiencia: el nivel técnico de quien leerá el resultado cambia la respuesta.",
  },
  {
    ok: false,
    text: "No uses adjetivos vacíos como «profesional» o «de alta calidad» sin definir el criterio.",
  },
  {
    ok: false,
    text: "No mezcles varias tareas en una sola petición: el modelo priorizará una y descuidará el resto.",
  },
  {
    ok: false,
    text: "No asumas que el modelo conoce tus datos internos: pásalos en el contexto o usa marcadores [COMPLETAR: …].",
  },
];

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground app-bg">
      <div className="mx-auto w-full max-w-4xl px-5 md:px-8 py-10 md:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al generador
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Documentación
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Guía de uso
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Un buen prompt es importante porque convierte una intención general en instrucciones claras, verificables y útiles para el modelo. Cuando defines el contexto, el objetivo y el formato de salida, reduces respuestas ambiguas, evitas que el modelo invente información y obtienes resultados más consistentes que puedes reutilizar.
          </p>
          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 max-w-2xl">
            <p className="text-xs leading-relaxed text-foreground/80"><strong className="text-foreground">La idea clave:</strong> la calidad de la respuesta depende en gran medida de la calidad de las instrucciones. Prompt Profesionales te ayuda a pasar de una petición vaga a un prompt estructurado y listo para usar.</p>
          </div>
        </header>

        {/* Anatomía */}
        <section className="mb-14">
          <h2 className="text-xl font-semibold tracking-tight mb-1 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Qué contiene un prompt optimizado
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Todo prompt que genera la aplicación sigue estas ocho secciones. Si falta
            alguna, el texto final pierde precisión.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ANATOMY.map((a) => (
              <div
                key={a.n}
                className="rounded-xl border border-border/60 bg-card/60 p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="h-6 w-6 shrink-0 rounded-md bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
                    {a.n}
                  </span>
                  <h3 className="text-sm font-semibold">{a.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pasos */}
        <section className="mb-14">
          <h2 className="text-xl font-semibold tracking-tight mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Cómo usarlo, paso a paso
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            El flujo completo, de la idea al prompt listo para producción.
          </p>
          <div className="space-y-3">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-xl border border-border/60 bg-card/60 p-4 md:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {s.body}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed flex items-start gap-1.5 text-foreground/70">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{s.tip}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Buenas prácticas */}
        <section className="mb-14">
          <h2 className="text-xl font-semibold tracking-tight mb-1 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Buenas prácticas
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Lo que marca la diferencia entre un prompt que funciona y uno que decepciona.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRACTICES.map((p, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3.5 text-xs leading-relaxed flex items-start gap-2.5 ${
                  p.ok
                    ? "border-emerald-500/25 bg-emerald-500/5"
                    : "border-rose-500/25 bg-rose-500/5"
                }`}
              >
                <span
                  className={`shrink-0 font-bold text-sm leading-none mt-0.5 ${
                    p.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {p.ok ? "✓" : "✕"}
                </span>
                <span className="text-foreground/80">{p.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Atajos y funciones */}
        <section className="mb-14">
          <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Funciones y atajos
          </h2>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-border/60">
                {[
                  ["Generar", "Describe la necesidad y pulsa Enter"],
                  ["Salto de línea", "Shift + Enter"],
                  ["Detener generación", "Botón cuadrado mientras responde"],
                  ["Mejorar prompt", "Botón con varita bajo cada respuesta"],
                  ["Copiar", "Botón de copiar bajo cada respuesta"],
                  ["Descargar", "Exporta el prompt como archivo .md"],
                  ["Nueva conversación", "Botón de reinicio en el compositor"],
                  ["Modo oscuro", "Botón luna/sol en la cabecera"],
                ].map(([k, v]) => (
                  <tr key={k} className="bg-card/40">
                    <td className="py-2.5 px-4 font-medium w-1/3">{k}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Límites */}
        <section className="mb-14">
          <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Límites y comportamiento
          </h2>
          <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <li className="flex gap-2">
              <span className="text-primary">·</span>
              El historial de la conversación vive en memoria: al recargar la página se
              pierde. Descarga los prompts que quieras conservar.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">·</span>
              El contexto adicional se recorta a ~8.000 caracteres. La app te avisa en el
              propio prompt cuando esto ocurre.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">·</span>
              Los repositorios se leen mediante la API pública de GitHub. Los repos
              privados requieren un token configurado en el servidor.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">·</span>
              La generación consume crédito de OpenRouter según el modelo elegido.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">·</span>
              Si un modelo devuelve un error, la app cae automáticamente al modelo por
              defecto (GPT-4o).
            </li>
          </ul>
        </section>

        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6 text-center">
          <Download className="h-5 w-5 text-primary mx-auto mb-2" />
          <h3 className="text-sm font-semibold mb-1">¿Listo para probar?</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Vuelve al generador y describe tu primera necesidad.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ir al generador
          </Link>
        </div>

        <footer className="mt-10 text-center text-[11px] text-muted-foreground">
          Prompt Profesionales · Generador inteligente de prompts
        </footer>
      </div>
    </div>
  );
}
