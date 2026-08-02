import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const todos = await db.event.findMany({
    orderBy: { data: "asc" },
    select: { id: true, nome: true, slug: true, data: true, status: true, visibilidade: true, destaqueManual: true },
  });
  console.log("TODOS OS EVENTOS (" + todos.length + "):");
  for (const e of todos) {
    console.log(`  ${e.data.toISOString().substring(0,16)} | ${e.status.padEnd(12)} | destaque=${e.destaqueManual} | ${e.nome} (slug: ${e.slug})`);
  }
  console.log("\nAGORA:", new Date().toISOString());
}
main().finally(() => db.$disconnect());
