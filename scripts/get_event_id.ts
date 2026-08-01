import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const e = await db.event.findFirst({ where: { status: "publicado" }, select: { id: true, nome: true, slug: true } });
  console.log(e?.id, e?.slug);
}
main().finally(() => db.$disconnect());
