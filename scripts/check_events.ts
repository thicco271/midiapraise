import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const e = await db.event.findMany({ select: { nome: true, slug: true, data: true, status: true } });
  console.log(JSON.stringify(e, null, 2));
}
main().finally(() => db.$disconnect());
