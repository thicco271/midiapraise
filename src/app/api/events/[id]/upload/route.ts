// POST /api/events/[id]/upload
// Multipart form-data com campo "file" + "tipo" + "nome" (opcional)
// Salva no Supabase Storage (nuvem) — funciona na Vercel
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import { slugify } from "@/lib/praise";
import { uploadToSupabase, gerarCaminhoStorage } from "@/lib/supabase-storage";
import sharp from "sharp";
import type { ApiResult, MediaAssetDTO, MediaVersionDTO, MediaType } from "@/types";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_EXT: Record<string, string> = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
  pdf: "pdf",
  mp4: "mp4",
  zip: "zip",
  heic: "heic",
  heif: "heif",
};

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const evento = await db.event.findUnique({ where: { id } });
  if (!evento) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Evento não encontrado" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Falha ao ler form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  const tipoRaw = String(formData.get("tipo") ?? "outros");
  const nomeInformado = String(formData.get("nome") ?? "").trim();

  if (!TIPOS_VALIDOS.includes(tipoRaw as MediaType)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Tipo inválido" }, { status: 400 });
  }
  const tipo = tipoRaw as MediaType;

  if (!(file instanceof File)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Arquivo não recebido" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Arquivo vazio" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Arquivo muito grande (máx 50MB)" }, { status: 413 });
  }

  // Determinar extensão (pelo nome, não pelo MIME type — mais confiável)
  const nomeOriginalLower = (file.name || "arquivo.png").toLowerCase();
  const extMatch = nomeOriginalLower.match(/\.([a-z0-9]+)$/);
  const extensao = extMatch ? ALLOWED_EXT[extMatch[1]] ?? "png" : "png";

  // Ler conteúdo
  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);

  // Pasta destino no Supabase
  const eventoSlug = slugify(evento.nome) || evento.id;
  const nomeBase = nomeInformado ? slugify(nomeInformado) : slugify(evento.nome) || "evento";

  // Busca ou cria MediaAsset
  const nomeAsset = nomeInformado || evento.nome;
  let asset = await db.mediaAsset.findFirst({
    where: { eventoId: evento.id, tipo, nome: nomeAsset },
    include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
  });

  const proximaVersao = asset ? (asset.versaoAtual + 1) : 1;
  const nomePadronizado = `${nomeBase}-${tipo}-v${proximaVersao}.${extensao}`;
  const caminhoStorage = gerarCaminhoStorage(eventoSlug, tipo, nomePadronizado);

  // MIME type
  let mimeType = file.type || "application/octet-stream";
  if (extensao === "jpg" || extensao === "jpeg") mimeType = "image/jpeg";
  else if (extensao === "png") mimeType = "image/png";
  else if (extensao === "webp") mimeType = "image/webp";
  else if (extensao === "gif") mimeType = "image/gif";
  else if (extensao === "pdf") mimeType = "application/pdf";
  else if (extensao === "mp4") mimeType = "video/mp4";
  else if (extensao === "zip") mimeType = "application/zip";

  // Upload para Supabase Storage
  let urlPublica: string;
  try {
    urlPublica = await uploadToSupabase(buffer, caminhoStorage, mimeType);
  } catch (err: any) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: err.message }, { status: 500 });
  }

  // Gerar thumbnail se for imagem
  let thumbnailUrl: string | null = null;
  let largura: number | null = null;
  let altura: number | null = null;

  if (IMAGE_EXTS.has(extensao) || mimeType.startsWith("image/")) {
    try {
      const metadata = await sharp(buffer).metadata();
      largura = metadata.width ?? null;
      altura = metadata.height ?? null;

      // Gerar thumbnail (400px)
      const thumbBuffer = await sharp(buffer, { failOn: "none" })
        .rotate()
        .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .withMetadata({ exif: {} })
        .toBuffer();

      const thumbName = `${nomeBase}-${tipo}-v${proximaVersao}-thumb.jpg`;
      const thumbPath = gerarCaminhoStorage(eventoSlug, `${tipo}/thumbs`, thumbName);
      thumbnailUrl = await uploadToSupabase(thumbBuffer, thumbPath, "image/jpeg");
    } catch (err) {
      console.warn("[upload] Falha ao gerar thumbnail:", err);
    }
  }

  // Criar MediaAsset se não existir
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
      data: { versaoAtual: proximaVersao },
      include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
    });
  }

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
      arquivoOficial,
      enviadoPorId: user.id,
    },
  });

  if (arquivoOficial) {
    await db.mediaVersion.updateMany({
      where: { mediaAssetId: asset.id, NOT: { id: novaVersao.id } },
      data: { arquivoOficial: false },
    });

    // Atualizar capa do evento
    await db.event.update({
      where: { id: evento.id },
      data: { capa: urlPublica },
    });
  }

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "criar",
      entidade: "media_asset",
      entidadeId: asset.id,
      descricao: `Arquivo '${nomePadronizado}' enviado para evento '${evento.nome}' (v${proximaVersao})`,
      dadosPosteriores: JSON.stringify({ assetId: asset.id, versao: proximaVersao, tipo, arquivoOficial }),
    },
  });

  const assetFinal = await db.mediaAsset.findUnique({
    where: { id: asset.id },
    include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
  });

  return NextResponse.json<ApiResult<MediaAssetDTO>>(
    { ok: true, data: mapAsset(assetFinal) },
    { status: 201 },
  );
}
