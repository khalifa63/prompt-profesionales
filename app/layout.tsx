import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Prompt Profesionales — Generador Inteligente de Prompts",
  description:
    "Genera prompts profesionales, estructurados y optimizados para modelos de lenguaje. Define tu base de conocimiento y obtén resultados de alta calidad.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}