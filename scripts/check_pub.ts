import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const all = await db.mediaAsset.findMany({
    where: { status: "publicado" },
    include: { evento: { select: { nome: true, slug: true } } },
  });
  console.log("Total publicado:", all.length);
  for (const a of all) {
    console.log("  -", a.nome, "→", a.evento.nome, "(", a.evento.slug, ")");
  }
}
main().finally(() => db.$disconnect());
