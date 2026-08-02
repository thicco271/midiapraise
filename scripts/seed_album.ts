// Cria um álbum de fotos para o evento Celebração da Família 02/08
// usando as fotos que já existem em /uploads/albuns/culto-da-familia-fotos/
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const db = new PrismaClient();

async function main() {
  const admin = await db.profile.findFirst({ where: { perfil: "administrador" } });
  if (!admin) { console.log("Admin não encontrado"); return; }

  // Buscar evento Celebração da Família 02/08
  const evento = await db.event.findFirst({
    where: {
      nome: "Celebração da Família",
      data: { gte: new Date("2026-08-02T00:00:00-03:00"), lte: new Date("2026-08-02T23:59:59-03:00") },
    },
  });

  if (!evento) {
    console.log("Evento Celebração da Família 02/08 não encontrado");
    return;
  }

  console.log(`Evento encontrado: ${evento.nome} (${evento.data.toISOString()})`);

  // Verificar se já existe álbum
  const albumExistente = await db.album.findFirst({
    where: { eventoId: evento.id },
  });
  if (albumExistente) {
    console.log(`Álbum já existe: ${albumExistente.nome}`);
    return;
  }

  // Criar álbum
  const slug = "celebracao-da-familia-0208-fotos";
  const album = await db.album.create({
    data: {
      eventoId: evento.id,
      nome: "Celebração da Família — Fotos",
      slug,
      descricao: "Momentos do culto de celebração da família em 02/08/2026",
      fotografo: "Equipe de Mídia ADSA Reimberg",
      status: "publicado",
      visibilidade: "publico",
      permitirDownload: true,
      criadoPorId: admin.id,
      publicadoEm: new Date(),
    },
  });
  console.log(`Álbum criado: ${album.nome} (slug: ${slug})`);

  // Verificar se as fotos existem no disco
  const fotosDir = path.join(process.cwd(), "public", "uploads", "adsa-reimberg", "albuns", "culto-da-familia-fotos");
  if (!fs.existsSync(fotosDir)) {
    console.log(`Pasta de fotos não existe: ${fotosDir}`);
    console.log("Criando fotos de exemplo...");

    // Criar fotos de exemplo
    fs.mkdirSync(fotosDir, { recursive: true });
    fs.mkdirSync(path.join(fotosDir, "thumbs"), { recursive: true });
    fs.mkdirSync(path.join(fotosDir, "otimizados"), { recursive: true });

    const sharp = (await import("sharp")).default;
    for (let i = 1; i <= 3; i++) {
      const r = (i * 80) % 255;
      const g = (i * 130) % 255;
      const b = (i * 200) % 255;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="rgb(${r},${g},${b})"/>
        <text x="400" y="300" font-size="80" font-family="sans-serif" fill="white" text-anchor="middle">Foto ${i}</text>
      </svg>`;
      const out = path.join(fotosDir, `foto-${i}.jpg`);
      await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(out);
      console.log(`Foto criada: ${out}`);
    }
  }

  // Listar fotos existentes
  const fotos = fs.readdirSync(fotosDir).filter(f => f.endsWith(".jpg") && !f.includes("-thumb") && !f.includes("-opt"));
  console.log(`Fotos encontradas: ${fotos.length}`);

  const PUBLIC_URL_BASE = "/uploads/adsa-reimberg";
  let ordem = 0;
  let capaPhotoId: string | null = null;

  for (const fotoNome of fotos) {
    ordem++;
    const caminhoOriginal = `${PUBLIC_URL_BASE}/albuns/culto-da-familia-fotos/${fotoNome}`;
    const nomeOtimizado = fotoNome.replace(".jpg", "-opt.jpg");
    const nomeThumb = fotoNome.replace(".jpg", "-thumb.jpg");
    const caminhoOtimizado = `${PUBLIC_URL_BASE}/albuns/culto-da-familia-fotos/otimizados/${nomeOtimizado}`;
    const caminhoThumb = `${PUBLIC_URL_BASE}/albuns/culto-da-familia-fotos/thumbs/${nomeThumb}`;

    // Verificar se otimizado e thumb existem
    const optExiste = fs.existsSync(path.join(fotosDir, "otimizados", nomeOtimizado));
    const thumbExiste = fs.existsSync(path.join(fotosDir, "thumbs", nomeThumb));

    const photo = await db.albumPhoto.create({
      data: {
        albumId: album.id,
        caminhoOriginal,
        caminhoOtimizado: optExiste ? caminhoOtimizado : null,
        caminhoThumbnail: thumbExiste ? caminhoThumb : null,
        nomeOriginal: fotoNome,
        ordem,
        status: "publicado",
        enviadoPorId: admin.id,
      },
    });

    if (ordem === 1) capaPhotoId = photo.id;
    console.log(`Foto criada: ${fotoNome} (ordem ${ordem})`);
  }

  // Definir capa
  if (capaPhotoId) {
    await db.album.update({
      where: { id: album.id },
      data: { capaPhotoId },
    });
    console.log(`Capa definida: ${capaPhotoId}`);
  }

  console.log("\n=== RESUMO ===");
  const totalFotos = await db.albumPhoto.count({ where: { albumId: album.id } });
  console.log(`Álbum: ${album.nome}`);
  console.log(`Total de fotos: ${totalFotos}`);
}

main().catch(console.error).finally(() => db.$disconnect());
