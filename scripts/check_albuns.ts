import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const albuns = await db.album.findMany({ include: { fotos: true, evento: { select: { nome: true } } } });
  console.log("ÁLBUNS:", albuns.length);
  for (const a of albuns) {
    console.log(`  ${a.nome} | status: ${a.status} | fotos: ${a.fotos.length} | evento: ${a.evento?.nome ?? "—"}`);
  }
}
main().finally(() => db.$disconnect());
