import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Prompt Profesionales";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ background: "linear-gradient(135deg,#312e81,#7c3aed,#c026d3)", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, color: "white", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 34, opacity: 0.85 }}>✦ Prompt Profesionales</div>
      <div style={{ fontSize: 72, fontWeight: 700, marginTop: 24 }}>Crea mejores prompts con IA</div>
      <div style={{ fontSize: 30, marginTop: 30, opacity: 0.9 }}>Constructor guiado · Plantillas · Contexto · Modelos IA</div>
    </div>,
    size
  );
}
