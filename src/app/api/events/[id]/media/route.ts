// GET /api/events/[id]/media - lista mídias de um evento
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import type { ApiResult, MediaAssetDTO, MediaVersionDTO } from "@/types";

function mapVersion(v: any): MediaVersionDTO {
  return {
    id: v.id,
    numeroDaVersao: v.numeroDaVersao,
    caminhoDoArquivo: v.caminhoDoArquivo,
    caminhoThumbnail: v.caminhoThumbnail,
    nomeOriginal: v.nomeOriginal,
    nomePadronizado: v.nomePadronizado,
    extensao: v.extensao,
    mimeType: v.mimeType,
    tamanho: v.tamanho,
    largura: v.largura,
    altura: v.altura,
    arquivoOficial: v.arquivoOficial,
    enviadoEm: v.enviadoEm instanceof Date ? v.enviadoEm.toISOString() : v.enviadoEm,
  };
}

function mapAsset(a: any): MediaAssetDTO {
  const versaoOficial = a.versoes?.find((v: any) => v.arquivoOficial) ?? a.versoes?.[0] ?? null;
  return {
    id: a.id,
    eventoId: a.eventoId,
    nome: a.nome,
    tipo: a.tipo,
    status: a.status,
    visibilidade: a.visibilidade,
    versaoAtual: a.versaoAtual,
    textoDeDivulgacao: a.textoDeDivulgacao,
    observacoes: a.observacoes,
    quantidadeDownloads: a.quantidadeDownloads,
    criadoEm: a.criadoEm instanceof Date ? a.criadoEm.toISOString() : a.criadoEm,
    atualizadoEm: a.atualizadoEm instanceof Date ? a.atualizadoEm.toISOString() : a.atualizadoEm,
    versaoOficial: versaoOficial ? mapVersion(versaoOficial) : null,
    versoes: (a.versoes ?? []).map(mapVersion),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Busca por id ou slug
  const evento = await db.event.findUnique({
    where: { id },
  }) ?? await db.event.findUnique({ where: { slug: id } });

  if (!evento) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Evento não encontrado" }, { status: 404 });
  }

  const user = await getCurrentUser();
  const isAdmin = user && canManageEvents(user.perfil);

  const where: any = { eventoId: evento.id };
  if (!isAdmin) {
    where.AND = [
      { status: "publicado" },
      { visibilidade: "publico" },
    ];
  }

  const assets = await db.mediaAsset.findMany({
    where,
    include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
    orderBy: [{ tipo: "asc" }, { criadoEm: "desc" }],
  });

  return NextResponse.json<ApiResult<MediaAssetDTO[]>>({
    ok: true,
    data: assets.map(mapAsset),
  });
}
