import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const cultos = await db.serviceSchedule.findMany({ orderBy: { diaSemana: "asc" } });
  for (const c of cultos) {
    console.log(c.nome, "| dia:", c.diaSemana, "| início:", c.horarioInicio, "| fim:", c.horarioFim);
  }
}
main().finally(() => db.$disconnect());
