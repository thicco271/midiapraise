import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const v = await db.mediaVersion.findFirst({ where: { arquivoOficial: true }, select: { id: true, nomePadronizado: true } });
  console.log(v?.id, v?.nomePadronizado);
}
main().finally(() => db.$disconnect());
