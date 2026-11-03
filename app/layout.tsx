import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prompt.seguimiento360.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Prompt Profesionales | Generador de prompts con IA", template: "%s | Prompt Profesionales" },
  description: "Crea prompts profesionales con IA usando un constructor guiado, plantillas, archivos de contexto y modelos como GPT, Gemini, Llama y DeepSeek.",
  keywords: ["generador de prompts", "prompts profesionales", "ingeniería de prompts", "prompt engineering", "plantillas de prompts", "IA", "inteligencia artificial"],
  authors: [{ name: "Prompt Profesionales" }],
  creator: "Prompt Profesionales",
  applicationName: "Prompt Profesionales",
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "es_ES", url: siteUrl, siteName: "Prompt Profesionales", title: "Prompt Profesionales | Generador de prompts con IA", description: "Convierte tus ideas en prompts claros, estructurados y reutilizables.", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Prompt Profesionales" }] },
  twitter: { card: "summary_large_image", title: "Prompt Profesionales | Generador de prompts con IA", description: "Crea prompts profesionales con constructor guiado y plantillas.", images: ["/opengraph-image"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = { "@context": "https://schema.org", "@type": "WebApplication", name: "Prompt Profesionales", url: siteUrl, applicationCategory: "BusinessApplication", operatingSystem: "Web", inLanguage: "es", description: "Generador de prompts profesionales con inteligencia artificial.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };
  return <html lang="es" suppressHydrationWarning><body className="font-sans antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />{children}</body></html>;
}
