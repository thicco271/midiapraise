// POST /api/albums/[id]/upload
// Multipart com campo "files" (múltiplos) — salva fotos no álbum
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import { slugify } from "@/lib/praise";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import type { ApiResult, AlbumPhotoDTO } from "@/types";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "adsa-reimberg");
const PUBLIC_URL_BASE = "/uploads/adsa-reimberg";
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB por foto

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

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

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const album = await db.album.findUnique({ where: { id } });
  if (!album) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Álbum não encontrado" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Falha ao ler multipart/form-data" }, { status: 400 });
  }

  const files = formData.getAll("files");
  if (files.length === 0) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Nenhum arquivo recebido" }, { status: 400 });
  }

  // Pasta: /public/uploads/adsa-reimberg/albuns/<album-slug>/
  const albumSlug = slugify(album.nome) || album.id;
  const dirRel = path.join("albuns", albumSlug);
  const dirAbs = path.join(UPLOAD_ROOT, dirRel);
  await ensureDir(dirAbs);
  await ensureDir(path.join(dirAbs, "thumbs"));
  await ensureDir(path.join(dirAbs, "otimizados"));

  // Ordem inicial: maior ordem atual + 1
  const ultimaOrdem = await db.albumPhoto.findFirst({
    where: { albumId: album.id },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  let proximaOrdem = (ultimaOrdem?.ordem ?? 0);

  const criadas: any[] = [];
  const falhas: { nome: string; erro: string }[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    if (file.size === 0) {
      falhas.push({ nome: file.name, erro: "Arquivo vazio" });
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      falhas.push({ nome: file.name, erro: `Excede ${MAX_FILE_SIZE / 1024 / 1024}MB` });
      continue;
    }

    const mimeType = (file.type || "application/octet-stream").toLowerCase();
    const extensao = ALLOWED_MIME[mimeType];
    if (!extensao) {
      falhas.push({ nome: file.name, erro: `Tipo não permitido: ${mimeType}` });
      continue;
    }

    try {
      const arrayBuf = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      proximaOrdem++;

      const timestamp = Date.now();
      const idx = String(proximaOrdem).padStart(3, "0");
      const nomeBase = `${albumSlug}-${idx}-${timestamp}`;

      // Original (apenas para imagens; HEIC/HEIF → converter para JPG)
      let extOriginal = extensao;
      let bufferOriginal = buffer;
      if (extensao === "heic" || extensao === "heif") {
        bufferOriginal = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
        extOriginal = "jpg";
      }
      const nomeOriginal = `${nomeBase}.${extOriginal}`;
      const caminhoOriginalAbs = path.join(dirAbs, nomeOriginal);
      await fs.writeFile(caminhoOriginalAbs, bufferOriginal);

      // Otimizado (max 1280px, JPEG qualidade 82)
      const nomeOtimizado = `${nomeBase}-opt.jpg`;
      const caminhoOtimizadoAbs = path.join(dirAbs, "otimizados", nomeOtimizado);
      let largura: number | null = null;
      let altura: number | null = null;

      try {
        const metadata = await sharp(bufferOriginal).metadata();
        largura = metadata.width ?? null;
        altura = metadata.height ?? null;

        await sharp(bufferOriginal, { failOn: "none" })
          .rotate()
          .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true })
          .withMetadata({ exif: {} })
          .toFile(caminhoOtimizadoAbs);
      } catch (err) {
        console.warn("[album-upload] Falha ao otimizar:", file.name, err);
      }

      // Thumbnail (400px, JPEG qualidade 75)
      const nomeThumb = `${nomeBase}-thumb.jpg`;
      const caminhoThumbAbs = path.join(dirAbs, "thumbs", nomeThumb);
      let caminhoThumbnail: string | null = null;
      try {
        await sharp(bufferOriginal, { failOn: "none" })
          .rotate()
          .resize({ width: 400, height: 400, fit: "cover", withoutEnlargement: true })
          .jpeg({ quality: 75, mozjpeg: true })
          .withMetadata({ exif: {} })
          .toFile(caminhoThumbAbs);
        caminhoThumbnail = `${PUBLIC_URL_BASE}/${path.join(dirRel, "thumbs", nomeThumb).split(path.sep).join("/")}`;
      } catch (err) {
        console.warn("[album-upload] Falha ao gerar thumbnail:", file.name, err);
      }

      const caminhoOriginalUrl = `${PUBLIC_URL_BASE}/${path.join(dirRel, nomeOriginal).split(path.sep).join("/")}`;
      const caminhoOtimizadoUrl = `${PUBLIC_URL_BASE}/${path.join(dirRel, "otimizados", nomeOtimizado).split(path.sep).join("/")}`;

      const foto = await db.albumPhoto.create({
        data: {
          albumId: album.id,
          caminhoOriginal: caminhoOriginalUrl,
          caminhoOtimizado: caminhoOtimizadoUrl,
          caminhoThumbnail,
          nomeOriginal: file.name,
          ordem: proximaOrdem,
          status: "publicado",
          enviadoPorId: user.id,
          largura,
          altura,
          tamanho: bufferOriginal.length,
          mimeType: extOriginal === "jpg" ? "image/jpeg" : mimeType,
        },
      });
      criadas.push(foto);
    } catch (err) {
      console.error("[album-upload] Erro em", file.name, err);
      falhas.push({ nome: file.name, erro: "Erro interno ao processar" });
    }
  }

  // Se álbum não tem capa ainda e criamos fotos, define a primeira como capa
  if (!album.capaPhotoId && criadas.length > 0) {
    await db.album.update({
      where: { id: album.id },
      data: { capaPhotoId: criadas[0].id },
    });
  }

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "criar",
      entidade: "album",
      entidadeId: album.id,
      descricao: `${criadas.length} foto(s) adicionada(s) ao álbum '${album.nome}' (${falhas.length} falha(s))`,
      dadosPosteriores: JSON.stringify({ criadas: criadas.length, falhas }),
    },
  });

  return NextResponse.json<ApiResult<{ fotos: AlbumPhotoDTO[]; falhas: typeof falhas }>>({
    ok: true,
    data: { fotos: criadas.map(mapPhoto), falhas },
  }, { status: 201 });
}
