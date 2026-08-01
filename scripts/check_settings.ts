import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const s = await db.churchSettings.findUnique({ where: { id: "singleton" } });
  if (!s) { console.log("Settings não encontradas"); return; }
  console.log("Endereço:", s.endereco);
  console.log("Logo:", s.logo);
  console.log("Icone:", s.icone);
  console.log("Nome igreja:", s.nomeDaIgreja);
}
main().finally(() => db.$disconnect());
