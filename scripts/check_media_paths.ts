import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const medias = await db.mediaAsset.findMany({
    include: { versoes: true, evento: { select: { nome: true } } },
  });
  console.log("MÍDIAS NO BANCO:", medias.length);
  for (const m of medias) {
    console.log(`\n${m.nome} (${m.tipo}) - evento: ${m.evento.nome} - status: ${m.status}`);
    for (const v of m.versoes) {
      console.log(`  v${v.numeroDaVersao}: ${v.caminhoDoArquivo}`);
      if (v.caminhoThumbnail) console.log(`  thumb: ${v.caminhoThumbnail}`);
    }
  }
}
main().finally(() => db.$disconnect());
