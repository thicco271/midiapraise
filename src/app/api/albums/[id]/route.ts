// GET    /api/albums/[id] - detalhe do álbum (com fotos)
// PATCH  /api/albums/[id] - editar álbum
// DELETE /api/albums/[id] - excluir álbum (apaga fotos físicas + registros)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import { uniqueSlug } from "@/lib/praise";
import fs from "node:fs/promises";
import path from "node:path";
import type { ApiResult, AlbumDTO, AlbumPhotoDTO } from "@/types";

function mapPhoto(p: any): AlbumPhotoDTO {
  return {
    id: p.id,
    albumId: p.albumId,
    caminhoOriginal: p.caminhoOriginal,
    caminhoOtimizado: p.caminhoOtimizado,
    caminhoThumbnail: p.caminhoThumbnail,
    nomeOriginal: p.nomeOriginal,
    legenda: p.legenda,
    ordem: p.ordem,
    status: p.status,
    enviadoEm: p.enviadoEm instanceof Date ? p.enviadoEm.toISOString() : p.enviadoEm,
    largura: p.largura,
    altura: p.altura,
    tamanho: p.tamanho,
    mimeType: p.mimeType,
  };
}

function mapAlbum(a: any): AlbumDTO & { fotos: AlbumPhotoDTO[] } {
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
    fotoCapa: fotoCapa ? mapPhoto(fotoCapa) : null,
    totalFotos: a.fotos?.length ?? 0,
    fotos: (a.fotos ?? []).map(mapPhoto).sort((x: AlbumPhotoDTO, y: AlbumPhotoDTO) => x.ordem - y.ordem),
  };
}

async function buscarPorIdOuSlug(id: string) {
  const porId = await db.album.findUnique({
    where: { id },
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });
  if (porId) return porId;
  return db.album.findUnique({
    where: { slug: id },
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await buscarPorIdOuSlug(id);
  if (!album) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Álbum não encontrado" }, { status: 404 });
  }

  const user = await getCurrentUser();
  const isAdmin = user && canManageEvents(user.perfil);
  if (!isAdmin && (album.status !== "publicado" || album.visibilidade !== "publico")) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Álbum não disponível" }, { status: 403 });
  }

  return NextResponse.json<ApiResult<AlbumDTO & { fotos: AlbumPhotoDTO[] }>>({ ok: true, data: mapAlbum(album) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const existente = await buscarPorIdOuSlug(id);
  if (!existente) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Álbum não encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const dados: any = { atualizadoEm: new Date() };

  if (typeof body?.nome === "string" && body.nome.trim() && body.nome !== existente.nome) {
    dados.nome = body.nome.trim();
    dados.slug = await uniqueSlug(
      dados.nome,
      async (s) => !!(await db.album.findFirst({ where: { slug: s, NOT: { id: existente.id } } })),
    );
  }
  if (body?.eventoId !== undefined) dados.eventoId = body.eventoId || null;
  if (typeof body?.descricao === "string") dados.descricao = body.descricao || null;
  if (typeof body?.fotografo === "string") dados.fotografo = body.fotografo || null;
  if (typeof body?.visibilidade === "string") dados.visibilidade = body.visibilidade;
  if (typeof body?.permitirDownload === "boolean") dados.permitirDownload = body.permitirDownload;
  if (typeof body?.aceitarContribuicoes === "boolean") dados.aceitarContribuicoes = body.aceitarContribuicoes;
  if (typeof body?.capaPhotoId === "string") dados.capaPhotoId = body.capaPhotoId || null;
  if (typeof body?.status === "string") {
    dados.status = body.status;
    if (body.status === "publicado" && !existente.publicadoEm) {
      dados.publicadoEm = new Date();
    }
  }

  const anterior = {
    nome: existente.nome,
    descricao: existente.descricao,
    fotografo: existente.fotografo,
    status: existente.status,
    visibilidade: existente.visibilidade,
    permitirDownload: existente.permitirDownload,
  };

  const atualizado = await db.album.update({
    where: { id: existente.id },
    data: dados,
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "atualizar",
      entidade: "album",
      entidadeId: atualizado.id,
      descricao: `Álbum '${atualizado.nome}' atualizado`,
      dadosAnteriores: JSON.stringify(anterior),
      dadosPosteriores: JSON.stringify(dados),
    },
  });

  return NextResponse.json<ApiResult<AlbumDTO & { fotos: AlbumPhotoDTO[] }>>({ ok: true, data: mapAlbum(atualizado) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.perfil !== "administrador") {
    return NextResponse.json<ApiResult<never>>(
      { ok: false, error: "Apenas administradores podem excluir álbuns" },
      { status: 403 },
    );
  }

  const album = await buscarPorIdOuSlug(id);
  if (!album) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Álbum não encontrado" }, { status: 404 });
  }

  // Apaga arquivos físicos das fotos
  const publicDir = path.join(process.cwd(), "public");
  let apagados = 0;
  for (const foto of album.fotos) {
    for (const caminho of [foto.caminhoOriginal, foto.caminhoOtimizado, foto.caminhoThumbnail]) {
      if (!caminho) continue;
      const rel = caminho.startsWith("/") ? caminho.slice(1) : caminho;
      const abs = path.join(publicDir, rel);
      try {
        await fs.unlink(abs);
        apagados++;
      } catch (err: any) {
        if (err?.code !== "ENOENT") console.warn("[delete-album] Falha ao apagar:", abs, err.message);
      }
    }
  }

  await db.album.delete({ where: { id: album.id } });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "excluir",
      entidade: "album",
      entidadeId: album.id,
      descricao: `Álbum '${album.nome}' excluído (${album.fotos.length} fotos, ${apagados} arquivos físicos apagados)`,
      dadosAnteriores: JSON.stringify({ nome: album.nome, fotos: album.fotos.length }),
    },
  });

  return NextResponse.json<ApiResult<{ id: string; apagados: number }>>({
    ok: true,
    data: { id: album.id, apagados },
  });
}
