// POST /api/events/[id]/upload
// Multipart form-data com campo "file" + "tipo" + "nome" (opcional)
// Salva arquivo em public/uploads/adsa-reimberg/<evento-slug>/<tipo>/<padronizado>
// Cria MediaAsset (se primeiro upload deste nome/tipo) ou nova MediaVersion (se já existe)
// Gera thumbnail com sharp + remove EXIF GPS

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import { slugify } from "@/lib/praise";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";
import type { ApiResult, MediaAssetDTO, MediaVersionDTO, MediaType } from "@/types";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "adsa-reimberg");
const PUBLIC_URL_BASE = "/uploads/adsa-reimberg";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
};

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const TIPOS_VALIDOS: MediaType[] = ["whatsapp", "rede_social", "banner_telao", "outros"];

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

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function fileChecksum(buf: Buffer): Promise<string> {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  // Busca evento
  const evento = await db.event.findUnique({ where: { id } });
  if (!evento) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Evento não encontrado" }, { status: 404 });
  }

  // Parse multipart
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return NextResponse.json<ApiResult<never>>(
      { ok: false, error: "Falha ao ler multipart/form-data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const tipoRaw = String(formData.get("tipo") ?? "outros");
  const nomeInformado = String(formData.get("nome") ?? "").trim();

  if (!TIPOS_VALIDOS.includes(tipoRaw as MediaType)) {
    return NextResponse.json<ApiResult<never>>(
      { ok: false, error: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(", ")}` },
      { status: 400 },
    );
  }
  const tipo = tipoRaw as MediaType;

  if (!(file instanceof File)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Arquivo não recebido" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Arquivo vazio" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json<ApiResult<never>>(
      { ok: false, error: `Arquivo excede o tamanho máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB` },
      { status: 413 },
    );
  }

  const mimeType = (file.type || "application/octet-stream").toLowerCase();
  const extensao = ALLOWED_MIME[mimeType];
  if (!extensao) {
    return NextResponse.json<ApiResult<never>>(
      { ok: false, error: `Tipo de arquivo não permitido: ${mimeType}` },
      { status: 415 },
    );
  }

  // Lê conteúdo
  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const checksum = await fileChecksum(buffer);

  // Pasta destino: /public/uploads/adsa-reimberg/<evento-slug>/<tipo>/
  const eventoSlug = slugify(evento.nome) || evento.id;
  const dirRel = path.join(eventoSlug, tipo);
  const dirAbs = path.join(UPLOAD_ROOT, dirRel);
  await ensureDir(dirAbs);

  // Nome padronizado: <slug-nome>-<tipo>-v<N>.<ext>
  const nomeBase = nomeInformado
    ? slugify(nomeInformado)
    : slugify(evento.nome) || "evento";

  // Busca ou cria MediaAsset
  const nomeAsset = nomeInformado || evento.nome;
  let asset = await db.mediaAsset.findFirst({
    where: { eventoId: evento.id, tipo, nome: nomeAsset },
    include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
  });

  const proximaVersao = asset ? (asset.versaoAtual + 1) : 1;
  const nomePadronizado = `${nomeBase}-${tipo}-v${proximaVersao}.${extensao}`;
  const caminhoRel = path.join(dirRel, nomePadronizado);
  const caminhoAbs = path.join(UPLOAD_ROOT, caminhoRel);
  const urlPublica = `${PUBLIC_URL_BASE}/${caminhoRel.split(path.sep).join("/")}`;

  // Salva arquivo (sobrescreve se já existir — não deveria, pois versão incrementa)
  await fs.writeFile(caminhoAbs, buffer);

  // Gera thumbnail se for imagem
  let thumbnailUrl: string | null = null;
  let largura: number | null = null;
  let altura: number | null = null;

  if (IMAGE_MIMES.has(mimeType) && extensao !== "heic" && extensao !== "heif") {
    try {
      const metadata = await sharp(buffer).metadata();
      largura = metadata.width ?? null;
      altura = metadata.height ?? null;

      const thumbName = `${nomeBase}-${tipo}-v${proximaVersao}-thumb.jpg`;
      const thumbRel = path.join(dirRel, "thumbs", thumbName);
      const thumbAbs = path.join(UPLOAD_ROOT, thumbRel);
      await ensureDir(path.dirname(thumbAbs));

      // Strip EXIF + resize para max 400px mantendo proporção
      await sharp(buffer, { failOn: "none" })
        .rotate() // aplica orientação EXIF
        .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 75, mozjpeg: true })
        .withMetadata({ exif: {} }) // strips EXIF
        .toFile(thumbAbs);

      thumbnailUrl = `${PUBLIC_URL_BASE}/${thumbRel.split(path.sep).join("/")}`;
    } catch (err) {
      console.warn("[upload] Falha ao gerar thumbnail:", err);
      // Continua sem thumbnail
    }
  }

  // Cria registros no banco
  if (!asset) {
    asset = await db.mediaAsset.create({
      data: {
        eventoId: evento.id,
        nome: nomeAsset,
        tipo,
        status: "rascunho",
        visibilidade: "publico",
        versaoAtual: proximaVersao,
        enviadoPorId: user.id,
      },
      include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
    });
  } else {
    asset = await db.mediaAsset.update({
      where: { id: asset.id },
      data: {
        versaoAtual: proximaVersao,
        atualizadoEm: new Date(),
      },
      include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
    });
  }

  // Cria versão (marcando como oficial se for a primeira OU se asset estava sem versão oficial)
  const haviaOficial = asset.versoes.some((v) => v.arquivoOficial);
  const arquivoOficial = !haviaOficial;

  const novaVersao = await db.mediaVersion.create({
    data: {
      mediaAssetId: asset.id,
      numeroDaVersao: proximaVersao,
      caminhoDoArquivo: urlPublica,
      caminhoThumbnail: thumbnailUrl,
      nomeOriginal: file.name,
      nomePadronizado,
      extensao,
      mimeType,
      tamanho: buffer.length,
      largura,
      altura,
      checksum,
      arquivoOficial,
      enviadoPorId: user.id,
    },
  });

  // Se virou oficial, desmarca as outras
  if (arquivoOficial) {
    await db.mediaVersion.updateMany({
      where: { mediaAssetId: asset.id, NOT: { id: novaVersao.id } },
      data: { arquivoOficial: false },
    });
  }

  // Auditoria
  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "criar",
      entidade: "media_asset",
      entidadeId: asset.id,
      descricao: `Arquivo '${nomePadronizado}' enviado para evento '${evento.nome}' (v${proximaVersao})`,
      dadosPosteriores: JSON.stringify({
        assetId: asset.id,
        versao: proximaVersao,
        tipo,
        tamanho: buffer.length,
        arquivoOficial,
      }),
    },
  });

  // Recarrega asset completo
  const assetFinal = await db.mediaAsset.findUnique({
    where: { id: asset.id },
    include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
  });

  return NextResponse.json<ApiResult<MediaAssetDTO>>(
    { ok: true, data: mapAsset(assetFinal) },
    { status: 201 },
  );
}
