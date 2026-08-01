// GET  /api/albums - lista álbuns (públicos para todos, todos para admin)
// POST /api/albums - cria álbum (admin/editor)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import { slugify, uniqueSlug } from "@/lib/praise";
import type { ApiResult, AlbumDTO } from "@/types";

function mapAlbum(a: any): AlbumDTO {
  const fotoCapa = a.capaPhotoId ? a.fotos?.find((f: any) => f.id === a.capaPhotoId) ?? null : null;
  return {
    id: a.id,
    eventoId: a.eventoId,
    nome: a.nome,
    slug: a.slug,
    descricao: a.descricao,
    fotografo: a.fotografo,
    capaPhotoId: a.capaPhotoId,
    status: a.status,
    visibilidade: a.visibilidade,
    permitirDownload: a.permitirDownload,
    aceitarContribuicoes: a.aceitarContribuicoes,
    criadoEm: a.criadoEm instanceof Date ? a.criadoEm.toISOString() : a.criadoEm,
    atualizadoEm: a.atualizadoEm instanceof Date ? a.atualizadoEm.toISOString() : a.atualizadoEm,
    publicadoEm: a.publicadoEm instanceof Date ? a.publicadoEm.toISOString() : a.publicadoEm,
    fotoCapa: fotoCapa
      ? {
          id: fotoCapa.id,
          albumId: fotoCapa.albumId,
          caminhoOriginal: fotoCapa.caminhoOriginal,
          caminhoOtimizado: fotoCapa.caminhoOtimizado,
          caminhoThumbnail: fotoCapa.caminhoThumbnail,
          nomeOriginal: fotoCapa.nomeOriginal,
          legenda: fotoCapa.legenda,
          ordem: fotoCapa.ordem,
          status: fotoCapa.status,
          enviadoEm: fotoCapa.enviadoEm instanceof Date ? fotoCapa.enviadoEm.toISOString() : fotoCapa.enviadoEm,
          largura: fotoCapa.largura,
          altura: fotoCapa.altura,
          tamanho: fotoCapa.tamanho,
          mimeType: fotoCapa.mimeType,
        }
      : null,
    totalFotos: a.fotos?.length ?? 0,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventoId = searchParams.get("eventoId");
  const user = await getCurrentUser();
  const isAdmin = user && canManageEvents(user.perfil);

  const where: any = {};
  if (eventoId) where.eventoId = eventoId;
  if (!isAdmin) {
    where.AND = [{ status: "publicado" }, { visibilidade: "publico" }];
  }

  const albuns = await db.album.findMany({
    where,
    include: { fotos: { select: { id: true, caminhoThumbnail: true, caminhoOriginal: true, legenda: true } } },
    orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
  });

  return NextResponse.json<ApiResult<AlbumDTO[]>>({ ok: true, data: albuns.map(mapAlbum) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const nome = String(body?.nome ?? "").trim();
  if (!nome) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Nome do álbum é obrigatório" }, { status: 400 });
  }

  const slug = await uniqueSlug(nome, async (s) => !!(await db.album.findUnique({ where: { slug: s } })));

  const novo = await db.album.create({
    data: {
      nome,
      slug,
      eventoId: body?.eventoId || null,
      descricao: body?.descricao || null,
      fotografo: body?.fotografo || null,
      status: body?.status || "rascunho",
      visibilidade: body?.visibilidade || "publico",
      permitirDownload: body?.permitirDownload ?? true,
      aceitarContribuicoes: body?.aceitarContribuicoes ?? false,
      criadoPorId: user.id,
      ...(body?.status === "publicado" ? { publicadoEm: new Date() } : {}),
    },
    include: { fotos: true },
  });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "criar",
      entidade: "album",
      entidadeId: novo.id,
      descricao: `Álbum '${novo.nome}' criado`,
      dadosPosteriores: JSON.stringify({ nome: novo.nome, slug: novo.slug, status: novo.status }),
    },
  });

  return NextResponse.json<ApiResult<AlbumDTO>>({ ok: true, data: mapAlbum(novo) }, { status: 201 });
}
