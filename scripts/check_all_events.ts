import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const todos = await db.event.findMany({
    orderBy: { data: "asc" },
    select: { id: true, nome: true, slug: true, data: true, status: true, visibilidade: true, destaqueManual: true },
  });
  console.log("TODOS OS EVENTOS:");
  for (const e of todos) {
    console.log(`${e.data.toISOString()} | ${e.status.padEnd(15)} | ${e.visibilidade.padEnd(20)} | destaque=${e.destaqueManual} | ${e.nome}`);
  }
  console.log("\nAGORA:", new Date().toISOString());
}
main().finally(() => db.$disconnect());
