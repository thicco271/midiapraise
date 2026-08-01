import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const eventos = await db.event.findMany({
    where: { status: "publicado", visibilidade: "publico" },
    include: { mediaAssets: { where: { status: "publicado" }, select: { id: true } } },
  });
  let total = 0;
  for (const e of eventos) {
    console.log(e.nome, "→", e.mediaAssets.length, "assets");
    total += e.mediaAssets.length;
  }
  console.log("TOTAL:", total);
}
main().finally(() => db.$disconnect());
