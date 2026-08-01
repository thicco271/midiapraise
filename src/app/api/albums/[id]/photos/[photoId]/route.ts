// PATCH /api/albums/[id]/photos/[photoId]
//   Body: { legenda?, ordem?, status? }  — edita uma foto
//   Body: { reordenar: [{id, ordem}, ...] }  — reordena múltiplas fotos
//   Body: { definirCapa: true }  — define esta foto como capa do álbum
// DELETE /api/albums/[id]/photos/[photoId]  — exclui foto (arquivo físico + registro)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import fs from "node:fs/promises";
import path from "node:path";
import type { ApiResult, AlbumPhotoDTO } from "@/types";

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  const { id, photoId } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const album = await db.album.findUnique({ where: { id } });
  if (!album) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Álbum não encontrado" }, { status: 404 });
  }

  const body = await req.json();

  // Reordenação em lote
  if (Array.isArray(body?.reordenar)) {
    const updates = body.reordenar as { id: string; ordem: number }[];
    for (const u of updates) {
      await db.albumPhoto.update({
        where: { id: u.id },
        data: { ordem: u.ordem },
      });
    }
    return NextResponse.json<ApiResult<{ atualizados: number }>>({ ok: true, data: { atualizados: updates.length } });
  }

  // Definir como capa
  if (body?.definirCapa === true) {
    const foto = await db.albumPhoto.findUnique({ where: { id: photoId } });
    if (!foto || foto.albumId !== album.id) {
      return NextResponse.json<ApiResult<never>>({ ok: false, error: "Foto não encontrada neste álbum" }, { status: 404 });
    }
    await db.album.update({
      where: { id: album.id },
      data: { capaPhotoId: photoId },
    });
    return NextResponse.json<ApiResult<{ capaPhotoId: string }>>({ ok: true, data: { capaPhotoId: photoId } });
  }

  // Edição simples
  const fotoExistente = await db.albumPhoto.findUnique({ where: { id: photoId } });
  if (!fotoExistente || fotoExistente.albumId !== album.id) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Foto não encontrada neste álbum" }, { status: 404 });
  }

  const dados: any = {};
  if (typeof body?.legenda === "string") dados.legenda = body.legenda.trim() || null;
  if (typeof body?.ordem === "number") dados.ordem = body.ordem;
  if (typeof body?.status === "string" && ["rascunho", "publicado", "arquivado"].includes(body.status)) {
    dados.status = body.status;
  }

  const atualizada = await db.albumPhoto.update({
    where: { id: photoId },
    data: dados,
  });

  return NextResponse.json<ApiResult<AlbumPhotoDTO>>({ ok: true, data: mapPhoto(atualizada) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  const { id, photoId } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const foto = await db.albumPhoto.findUnique({ where: { id: photoId }, include: { album: true } });
  if (!foto || foto.albumId !== id) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Foto não encontrada" }, { status: 404 });
  }

  // Apaga arquivos físicos
  const publicDir = path.join(process.cwd(), "public");
  let apagados = 0;
  for (const caminho of [foto.caminhoOriginal, foto.caminhoOtimizado, foto.caminhoThumbnail]) {
    if (!caminho) continue;
    const rel = caminho.startsWith("/") ? caminho.slice(1) : caminho;
    const abs = path.join(publicDir, rel);
    try {
      await fs.unlink(abs);
      apagados++;
    } catch (err: any) {
      if (err?.code !== "ENOENT") console.warn("[delete-photo] Falha:", abs, err.message);
    }
  }

  // Se era a capa, limpa referência
  if (foto.album.capaPhotoId === foto.id) {
    // Próxima foto por ordem vira capa
    const proximaCapa = await db.albumPhoto.findFirst({
      where: { albumId: foto.albumId, NOT: { id: foto.id } },
      orderBy: { ordem: "asc" },
    });
    await db.album.update({
      where: { id: foto.albumId },
      data: { capaPhotoId: proximaCapa?.id ?? null },
    });
  }

  await db.albumPhoto.delete({ where: { id: foto.id } });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "excluir",
      entidade: "album_photo",
      entidadeId: foto.id,
      descricao: `Foto '${foto.nomeOriginal}' excluída do álbum '${foto.album.nome}' (${apagados} arquivos apagados)`,
    },
  });

  return NextResponse.json<ApiResult<{ id: string; apagados: number }>>({
    ok: true,
    data: { id: foto.id, apagados },
  });
}
