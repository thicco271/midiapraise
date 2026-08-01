// Atualiza endereço da igreja + faz seed dos cultos recorrentes
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("[seed-cultos] Atualizando endereço e criando cultos…");

  // 1. Atualiza endereço da igreja
  await db.churchSettings.update({
    where: { id: "singleton" },
    data: {
      endereco: "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP, 04845-085",
      logo: "/logo-adsa-azul.png",
      icone: "/logo-adsa-transparente.png",
    },
  });
  console.log("[seed-cultos] Endereço + logo atualizados.");

  // 2. Cria cultos recorrentes (se não existirem)
  const cultos = [
    { nome: "Celebração da Família", diaSemana: 0, horarioInicio: "18:00", horarioFim: "20:00", categoria: "culto", ordem: 1 },
    { nome: "Escola Bíblica Dominical (EBD)", diaSemana: 0, horarioInicio: "09:00", horarioFim: null, categoria: "ebd", ordem: 0 },
    { nome: "Terça da Vitória", diaSemana: 2, horarioInicio: "19:30", horarioFim: "21:00", categoria: "culto", ordem: 2 },
    { nome: "Quarta Profética", diaSemana: 3, horarioInicio: "19:30", horarioFim: "21:00", categoria: "culto", ordem: 3 },
  ];

  for (const c of cultos) {
    const existe = await db.serviceSchedule.findFirst({
      where: { nome: c.nome, diaSemana: c.diaSemana },
    });
    if (!existe) {
      await db.serviceSchedule.create({ data: c });
      console.log(`[seed-cultos] Criado: ${c.nome}`);
    } else {
      console.log(`[seed-cultos] Já existe: ${c.nome}`);
    }
  }

  console.log("[seed-cultos] Concluído.");
}

main()
  .catch((err) => {
    console.error("[seed-cultos] ERRO:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
