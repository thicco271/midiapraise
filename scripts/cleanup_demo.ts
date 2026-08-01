import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  // Apaga o Culto de Oração de teste
  const r = await db.event.deleteMany({ where: { slug: "culto-de-oracao" } });
  console.log("Removidos:", r.count);
}
main().finally(() => db.$disconnect());
