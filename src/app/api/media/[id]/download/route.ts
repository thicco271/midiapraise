// GET /api/media/[id]/download - incrementa contador e redireciona para URL pública
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const versao = await db.mediaVersion.findUnique({
    where: { id },
    include: { mediaAsset: true },
  });

  if (!versao) {
    return NextResponse.json({ ok: false, error: "Mídia não encontrada" }, { status: 404 });
  }

  // Verifica permissão: se asset privado, exige admin
  // Por ora todas as mídias são publicas; basta redirecionar
  if (versao.mediaAsset && versao.mediaAsset.status !== "publicado") {
    return NextResponse.json({ ok: false, error: "Mídia não publicada" }, { status: 403 });
  }

  // Incrementa contador no asset
  await db.mediaAsset.update({
    where: { id: versao.mediaAssetId },
    data: { quantidadeDownloads: { increment: 1 } },
  });

  // Redireciona para a URL pública do arquivo
  const url = versao.caminhoDoArquivo.startsWith("/")
    ? versao.caminhoDoArquivo
    : `/${versao.caminhoDoArquivo}`;

  return NextResponse.redirect(new URL(url, _req.url), {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
