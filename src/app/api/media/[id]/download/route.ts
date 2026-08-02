// GET /api/media/[id]/download - redireciona para URL do Supabase Storage
// Não exige login — apenas verifica se a mídia está publicada
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const versao = await db.mediaVersion.findUnique({
    where: { id },
    include: { mediaAsset: true },
  });

  if (!versao) {
    return new NextResponse("Mídia não encontrada", { status: 404 });
  }

  if (versao.mediaAsset && versao.mediaAsset.status !== "publicado") {
    return new NextResponse("Mídia não publicada", { status: 403 });
  }

  // Incrementa contador
  await db.mediaAsset.update({
    where: { id: versao.mediaAssetId },
    data: { quantidadeDownloads: { increment: 1 } },
  });

  // URL do arquivo (Supabase Storage ou local)
  const url = versao.caminhoDoArquivo;

  // Se for URL do Supabase (https://), redireciona
  if (url.startsWith("http")) {
    return NextResponse.redirect(url, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(versao.nomePadronizado)}"`,
      },
    });
  }

  // Se for caminho relativo (/uploads/...), redireciona para o domínio atual
  const fullUrl = url.startsWith("/") ? url : `/${url}`;
  return NextResponse.redirect(new URL(fullUrl, _req.nextUrl.origin), {
    status: 302,
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(versao.nomePadronizado)}"`,
    },
  });
}
