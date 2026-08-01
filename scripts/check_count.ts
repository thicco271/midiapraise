import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const a = await db.mediaAsset.findFirst({ select: { nome: true, quantidadeDownloads: true } });
  console.log(a);
}
main().finally(() => db.$disconnect());
