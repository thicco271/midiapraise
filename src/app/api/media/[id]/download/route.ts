// GET /api/media/[id]/download - incrementa contador e redireciona para URL pública
// Não exige login — apenas verifica se a mídia está publicada
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const versao = await db.mediaVersion.findUnique({
    where: { id },
    include: { mediaAsset: true },
  });

  if (!versao) {
    return NextResponse.json({ ok: false, error: "Mídia não encontrada" }, { status: 404 });
  }

  // Verifica se está publicado — se não, bloqueia
  if (versao.mediaAsset && versao.mediaAsset.status !== "publicado") {
    return NextResponse.json({ ok: false, error: "Mídia não publicada" }, { status: 403 });
  }

  // Incrementa contador no asset
  await db.mediaAsset.update({
    where: { id: versao.mediaAssetId },
    data: { quantidadeDownloads: { increment: 1 } },
  });

  // Caminho relativo (sempre começa com /)
  const url = versao.caminhoDoArquivo.startsWith("/")
    ? versao.caminhoDoArquivo
    : `/${versao.caminhoDoArquivo}`;

  // Redirecionamento 302 — funciona atrás de proxy/CDN sem perder host
  // Força Content-Disposition: attachment para garantir download (não inline)
  const redirectUrl = new URL(url, req.nextUrl.origin);
  return NextResponse.redirect(redirectUrl, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${versao.nomePadronizado}"`,
    },
  });
}
