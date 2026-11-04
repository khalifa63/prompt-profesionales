import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff", "image/svg+xml", "image/avif"]);
const TEXT_EXTENSIONS = /\.(txt|md|csv|json|js|ts|tsx|py|html|css|xml|yaml|yml)$/i;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "El archivo supera el límite de 5 MB." }, { status: 413 });
    const buffer = Buffer.from(await file.arrayBuffer());
    if (IMAGE_TYPES.has(file.type) || file.name.match(/\.(jpe?g|png|gif|webp|bmp|tiff?|svg|avif)$/i)) {
      const mime = IMAGE_TYPES.has(file.type) ? file.type : "image/" + file.name.split(".").pop();
      return NextResponse.json({ success: true, type: "image", name: file.name, mime, dataUrl: `data:${mime};base64,${buffer.toString("base64")}` });
    }
    let text = "";
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (TEXT_EXTENSIONS.test(file.name)) {
      text = buffer.toString("utf8");
    } else {
      return NextResponse.json({ error: "Formato no compatible. Usa texto, PDF o una imagen." }, { status: 415 });
    }
    if (!text.trim()) return NextResponse.json({ error: "No se encontró texto legible." }, { status: 422 });
    return NextResponse.json({ success: true, name: file.name, text: text.slice(0, 8000) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "No se pudo procesar el archivo." }, { status: 500 });
  }
}
