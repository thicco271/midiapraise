import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const fotos = await db.albumPhoto.findMany({
    select: { id: true, nomeOriginal: true, caminhoOriginal: true, caminhoOtimizado: true, caminhoThumbnail: true, mimeType: true, tamanho: true },
    take: 5,
  });
  for (const f of fotos) {
    console.log("---");
    console.log("Foto:", f.nomeOriginal);
    console.log("  Original:", f.caminhoOriginal);
    console.log("  Otimizado:", f.caminhoOtimizado);
    console.log("  Thumbnail:", f.caminhoThumbnail);
    console.log("  Mime:", f.mimeType, "| Tamanho:", f.tamanho);
  }
}
main().finally(() => db.$disconnect());
