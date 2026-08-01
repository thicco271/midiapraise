import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const logs = await db.auditLog.findMany({
    where: { entidade: "media_asset" },
    orderBy: { criadoEm: "desc" },
    take: 5,
    include: { usuario: { select: { nome: true } } },
  });
  for (const l of logs) {
    console.log("---");
    console.log("Ação:", l.acao);
    console.log("Quando:", l.criadoEm.toISOString());
    console.log("User:", l.usuario?.nome);
    console.log("Descrição:", l.descricao);
    if (l.dadosPosteriores) console.log("Depois:", l.dadosPosteriores.substring(0, 200));
  }
}
main().finally(() => db.$disconnect());
