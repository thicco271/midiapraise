// GET /api/media/[id]/download - serve o arquivo físico diretamente
// Não exige login — apenas verifica se a mídia está publicada
// Servir direto evita redirect para 0.0.0.0 em ambientes com proxy
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const versao = await db.mediaVersion.findUnique({
    where: { id },
    include: { mediaAsset: true },
  });

  if (!versao) {
    return new NextResponse("Mídia não encontrada", { status: 404 });
  }

  // Verifica se está publicado — se não, bloqueia
  if (versao.mediaAsset && versao.mediaAsset.status !== "publicado") {
    return new NextResponse("Mídia não publicada", { status: 403 });
  }

  // Incrementa contador no asset
  await db.mediaAsset.update({
    where: { id: versao.mediaAssetId },
    data: { quantidadeDownloads: { increment: 1 } },
  });

  // Caminho físico do arquivo
  // versao.caminhoDoArquivo é "/uploads/adsa-reimberg/..." (caminho público)
  const publicDir = path.join(process.cwd(), "public");
  const caminhoRel = versao.caminhoDoArquivo.startsWith("/")
    ? versao.caminhoDoArquivo.slice(1)
    : versao.caminhoDoArquivo;
  const caminhoAbs = path.join(publicDir, caminhoRel);

  try {
    const buffer = await fs.readFile(caminhoAbs);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": versao.mimeType || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(versao.nomePadronizado)}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[download] Falha ao ler arquivo:", caminhoAbs, err);
    return new NextResponse("Arquivo físico não encontrado no servidor", { status: 404 });
  }
}
