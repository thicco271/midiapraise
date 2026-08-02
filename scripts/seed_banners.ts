// Faz upload de banners para os cultos via API
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const db = new PrismaClient();
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "adsa-reimberg");
const PUBLIC_URL_BASE = "/uploads/adsa-reimberg";

async function main() {
  const admin = await db.profile.findFirst({ where: { perfil: "administrador" } });
  if (!admin) { console.log("Admin não encontrado"); return; }

  const bannersDir = "/tmp/banners-cultos";
  const banners = fs.readdirSync(bannersDir).filter(f => f.endsWith(".png"));

  // Mapear banners para eventos
  const eventos = await db.event.findMany({
    where: { status: "publicado" },
    orderBy: { data: "asc" },
  });

  console.log("Eventos encontrados:", eventos.length);
  for (const e of eventos) {
    console.log(`  ${e.data.toISOString().substring(0,16)} | ${e.nome} | slug: ${e.slug}`);
  }

  // Para cada evento, encontrar um banner correspondente
  const mapeamento: { evento: any; bannerPath: string }[] = [];

  // Celebracao da Familia 02/08
  const celeb0208 = eventos.find(e => e.nome === "Celebração da Família" && e.data.toISOString().includes("2026-08-02"));
  if (celeb0208) mapeamento.push({ evento: celeb0208, bannerPath: path.join(bannersDir, "celebracao-familia-0208.png") });

  // Terça da Vitória 04/08
  const terca0408 = eventos.find(e => e.nome === "Terça da Vitória" && e.data.toISOString().includes("2026-08-04"));
  if (terca0408) mapeamento.push({ evento: terca0408, bannerPath: path.join(bannersDir, "terca-vitoria-0408.png") });

  // Quarta Profética 05/08
  const quarta0508 = eventos.find(e => e.nome === "Quarta Profética" && e.data.toISOString().includes("2026-08-05"));
  if (quarta0508) mapeamento.push({ evento: quarta0508, bannerPath: path.join(bannersDir, "quarta-profetica-0508.png") });

  // EBD 09/08
  const ebd0908 = eventos.find(e => e.nome === "Escola Bíblica Dominical (EBD)" && e.data.toISOString().includes("2026-08-09"));
  if (ebd0908) mapeamento.push({ evento: ebd0908, bannerPath: path.join(bannersDir, "ebd-0908.png") });

  // Celebração 09/08 (segundo culto do dia 9)
  const celeb0908 = eventos.find(e => e.nome === "Celebração da Família" && e.data.toISOString().includes("2026-08-09") && e.data.toISOString().includes("21:00"));
  if (celeb0908) mapeamento.push({ evento: celeb0908, bannerPath: path.join(bannersDir, "celebracao-familia-0208.png") });

  console.log("\nMapeamento:");
  for (const m of mapeamento) {
    console.log(`  ${m.evento.nome} (${m.evento.data.toISOString().substring(0,16)}) ← ${path.basename(m.bannerPath)}`);
  }

  // Para cada mapeamento, criar mídia + versão
  for (const { evento, bannerPath } of mapeamento) {
    const buffer = fs.readFileSync(bannerPath);
    const nomeArquivo = path.basename(bannerPath);
    const extensao = "png";
    const mimeType = "image/png";

    // Pasta destino
    const eventoSlug = evento.slug.replace(/-\d{4}-\d{2}-\d{2}$/, "");
    const tipo = "banner_telao";
    const dirRel = path.join(eventoSlug, tipo);
    const dirAbs = path.join(UPLOAD_ROOT, dirRel);
    fs.mkdirSync(dirAbs, { recursive: true });
    fs.mkdirSync(path.join(dirAbs, "thumbs"), { recursive: true });

    // Verificar se já existe mídia para este evento+tipo
    const existente = await db.mediaAsset.findFirst({
      where: { eventoId: evento.id, tipo },
      include: { versoes: true },
    });

    if (existente) {
      console.log(`\n[${evento.nome}] Já tem mídia — pulando`);
      continue;
    }

    // Nome padronizado
    const nomeBase = eventoSlug;
    const versaoNum = 1;
    const nomePadronizado = `${nomeBase}-${tipo}-v${versaoNum}.${extensao}`;
    const caminhoRel = path.join(dirRel, nomePadronizado);
    const caminhoAbs = path.join(UPLOAD_ROOT, caminhoRel);
    const urlPublica = `${PUBLIC_URL_BASE}/${caminhoRel.split(path.sep).join("/")}`;

    // Salvar arquivo
    fs.writeFileSync(caminhoAbs, buffer);

    // Gerar thumbnail
    const thumbName = `${nomeBase}-${tipo}-v${versaoNum}-thumb.jpg`;
    const thumbRel = path.join(dirRel, "thumbs", thumbName);
    const thumbAbs = path.join(UPLOAD_ROOT, thumbRel);
    let thumbUrl: string | null = null;
    let largura: number | null = null;
    let altura: number | null = null;

    try {
      const metadata = await sharp(buffer).metadata();
      largura = metadata.width ?? null;
      altura = metadata.height ?? null;

      await sharp(buffer, { failOn: "none" })
        .rotate()
        .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 75, mozjpeg: true })
        .withMetadata({ exif: {} })
        .toFile(thumbAbs);

      thumbUrl = `${PUBLIC_URL_BASE}/${thumbRel.split(path.sep).join("/")}`;
    } catch (err) {
      console.warn(`[${evento.nome}] Falha ao gerar thumbnail:`, err);
    }

    // Criar MediaAsset
    const asset = await db.mediaAsset.create({
      data: {
        eventoId: evento.id,
        nome: evento.nome,
        tipo,
        status: "publicado",
        visibilidade: "publico",
        versaoAtual: versaoNum,
        enviadoPorId: admin.id,
        aprovadoPorId: admin.id,
        aprovadoEm: new Date(),
        publicadoEm: new Date(),
      },
    });

    // Criar versão
    await db.mediaVersion.create({
      data: {
        mediaAssetId: asset.id,
        numeroDaVersao: versaoNum,
        caminhoDoArquivo: urlPublica,
        caminhoThumbnail: thumbUrl,
        nomeOriginal: nomeArquivo,
        nomePadronizado,
        extensao,
        mimeType,
        tamanho: buffer.length,
        largura,
        altura,
        arquivoOficial: true,
        enviadoPorId: admin.id,
      },
    });

    // Atualizar capa do evento
    await db.event.update({
      where: { id: evento.id },
      data: { capa: urlPublica },
    });

    console.log(`\n[${evento.nome}] Banner criado:`);
    console.log(`  URL: ${urlPublica}`);
    console.log(`  Thumb: ${thumbUrl}`);
    console.log(`  Dimensões: ${largura}x${altura}`);
  }

  // Resumo final
  const totalMedias = await db.mediaAsset.count();
  console.log(`\n=== RESUMO ===`);
  console.log(`Total de mídias no banco: ${totalMedias}`);

  const eventosComCapa = await db.event.findMany({
    where: { capa: { not: null } },
    select: { nome: true, capa: true },
  });
  console.log(`Eventos com capa: ${eventosComCapa.length}`);
  for (const e of eventosComCapa) {
    console.log(`  ${e.nome}: ${e.capa}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
