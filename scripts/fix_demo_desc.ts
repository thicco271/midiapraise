import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const e = await db.event.findFirst({
    where: { slug: "culto-da-familia-2026-08-09" },
  });
  if (!e) { console.log("Não encontrado"); return; }
  const novaDesc = e.descricao?.replace(/ADSA Praise/g, "ADSA Reimberg") ?? null;
  await db.event.update({
    where: { id: e.id },
    data: { descricao: novaDesc },
  });
  console.log("Descrição atualizada:", novaDesc);
}
main().finally(() => db.$disconnect());
