import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TreeFile {
  path: string;
  size?: number;
}

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|py|go|rs|java|kt|rb|php|cs|cpp|c|h|hpp|swift|sh|yml|yaml|toml|sql|vue|svelte|html|css|scss)$/i;
const SKIP_DIR = /(^|\/)(node_modules|\.git|dist|build|\.next|vendor|__pycache__|\.venv|coverage)(\/|$)/i;
const MAX_FILES = 500;

async function fetchTree(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<{ ok: boolean; tree?: TreeFile[]; message?: string }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "prompt-profesionales",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers, cache: "no-store" }
  );

  if (res.status === 404) return { ok: false, message: "not-found" };
  if (res.status === 403) {
    return {
      ok: false,
      message:
        "GitHub limitó las peticiones (límite de la API pública). Inténtalo en unos minutos o configura GITHUB_TOKEN.",
    };
  }
  if (!res.ok) return { ok: false, message: `GitHub respondió ${res.status}.` };

  const data = await res.json();
  if (!Array.isArray(data?.tree)) {
    return { ok: false, message: "Respuesta inesperada de GitHub." };
  }
  return { ok: true, tree: data.tree };
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Cuerpo inválido." },
      { status: 400 }
    );
  }

  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json(
      { success: false, error: "Falta la URL del repositorio." },
      { status: 400 }
    );
  }

  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
  if (!match) {
    return NextResponse.json(
      { success: false, error: "URL de GitHub no válida. Ejemplo: https://github.com/usuario/repo" },
      { status: 400 }
    );
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, "");
  const token = process.env.GITHUB_TOKEN;

  try {
    let result = await fetchTree(owner, repo, "main", token);
    if (!result.ok && result.message === "not-found") {
      result = await fetchTree(owner, repo, "master", token);
    }

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            result.message === "not-found"
              ? `No se encontró el repositorio ${owner}/${repo} (o es privado).`
              : result.message,
        },
        { status: 502 }
      );
    }

    const files = (result.tree ?? [])
      .filter((f: any) => f.type === "blob" && !SKIP_DIR.test(f.path) && CODE_EXT.test(f.path))
      .map((f: any) => ({ path: f.path, size: f.size ?? 0 }))
      .slice(0, MAX_FILES);

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "El repositorio no contiene archivos de código reconocibles." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { repo: `${owner}/${repo}`, count: files.length, files },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Error al consultar GitHub." },
      { status: 500 }
    );
  }
}
