import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const albuns = await db.album.findMany({ include: { fotos: { orderBy: { ordem: "asc" } }, evento: { select: { nome: true } } } });
  for (const a of albuns) {
    console.log("---");
    console.log("Álbum:", a.nome, "| slug:", a.slug, "| status:", a.status);
    console.log("Evento:", a.evento?.nome ?? "—", "| fotografo:", a.fotografo);
    console.log("Fotos:", a.fotos.length);
    for (const f of a.fotos) {
      console.log("  v" + f.ordem, f.nomeOriginal, "→", f.caminhoThumbnail?.split("/").pop());
    }
  }
}
main().finally(() => db.$disconnect());
