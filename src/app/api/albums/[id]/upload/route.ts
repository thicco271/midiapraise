// POST /api/albums/[id]/upload
// Multipart com campo "files" (múltiplos) — salva fotos no Supabase Storage
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import { slugify } from "@/lib/praise";
import { uploadToSupabase, gerarCaminhoAlbum } from "@/lib/supabase-storage";
import sharp from "sharp";
import type { ApiResult, AlbumPhotoDTO } from "@/types";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB por foto

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);

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
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Falha ao ler form-data" }, { status: 400 });
  }

  const files = formData.getAll("files");
  if (files.length === 0) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Nenhum arquivo recebido" }, { status: 400 });
  }

  const albumSlug = slugify(album.nome) || album.id;

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

    try {
      const arrayBuf = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      proximaOrdem++;

      const timestamp = Date.now();
      const idx = String(proximaOrdem).padStart(3, "0");
      const nomeBase = `${albumSlug}-${idx}-${timestamp}`;

      // Detectar extensão
      const nomeLower = (file.name || "foto.jpg").toLowerCase();
      const extMatch = nomeLower.match(/\.([a-z0-9]+)$/);
      let extensao = extMatch ? extMatch[1] : "jpg";
      if (extensao === "jpeg") extensao = "jpg";

      let mimeType = file.type || "image/jpeg";
      if (extensao === "jpg") mimeType = "image/jpeg";
      else if (extensao === "png") mimeType = "image/png";
      else if (extensao === "webp") mimeType = "image/webp";
      else if (extensao === "gif") mimeType = "image/gif";

      // Converter HEIC/HEIF para JPG
      let bufferOriginal = buffer;
      let extOriginal = extensao;
      if (extensao === "heic" || extensao === "heif") {
        bufferOriginal = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
        extOriginal = "jpg";
        mimeType = "image/jpeg";
      }

      // Upload original
      const nomeOriginal = `${nomeBase}.${extOriginal}`;
      const caminhoOriginal = gerarCaminhoAlbum(albumSlug, nomeOriginal);
      const urlOriginal = await uploadToSupabase(bufferOriginal, caminhoOriginal, mimeType);

      // Otimizado (1280px)
      let urlOtimizada: string | null = null;
      let largura: number | null = null;
      let altura: number | null = null;

      try {
        const metadata = await sharp(bufferOriginal).metadata();
        largura = metadata.width ?? null;
        altura = metadata.height ?? null;

        const optBuffer = await sharp(bufferOriginal, { failOn: "none" })
          .rotate()
          .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 82 })
          .withMetadata({ exif: {} })
          .toBuffer();

        const nomeOtimizado = `${nomeBase}-opt.jpg`;
        const caminhoOpt = gerarCaminhoAlbum(albumSlug, `otimizados/${nomeOtimizado}`);
        urlOtimizada = await uploadToSupabase(optBuffer, caminhoOpt, "image/jpeg");
      } catch (err) {
        console.warn("[album-upload] Falha ao otimizar:", file.name);
      }

      // Thumbnail (400px)
      let urlThumb: string | null = null;
      try {
        const thumbBuffer = await sharp(bufferOriginal, { failOn: "none" })
          .rotate()
          .resize({ width: 400, height: 400, fit: "cover", withoutEnlargement: true })
          .jpeg({ quality: 75 })
          .withMetadata({ exif: {} })
          .toBuffer();

        const nomeThumb = `${nomeBase}-thumb.jpg`;
        const caminhoThumb = gerarCaminhoAlbum(albumSlug, `thumbs/${nomeThumb}`);
        urlThumb = await uploadToSupabase(thumbBuffer, caminhoThumb, "image/jpeg");
      } catch (err) {
        console.warn("[album-upload] Falha ao gerar thumbnail:", file.name);
      }

      const foto = await db.albumPhoto.create({
        data: {
          albumId: album.id,
          caminhoOriginal: urlOriginal,
          caminhoOtimizado: urlOtimizada,
          caminhoThumbnail: urlThumb,
          nomeOriginal: file.name,
          ordem: proximaOrdem,
          status: "publicado",
          enviadoPorId: user.id,
          largura,
          altura,
          tamanho: bufferOriginal.length,
          mimeType,
        },
      });
      criadas.push(foto);
    } catch (err) {
      console.error("[album-upload] Erro em", file.name, err);
      falhas.push({ nome: file.name, erro: "Erro interno" });
    }
  }

  // Definir capa se necessário
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
