// Atualiza nomes antigos (PraiseHub / ADSA Praise) para os novos
// (ADSA Reimberg Mídias / ADSA Reimberg) no banco existente.
// Idempotente: pode rodar várias vezes.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("[rename] Atualizando nomes no banco…");

  // 1. ChurchSettings (singleton)
  const settings = await db.churchSettings.findUnique({ where: { id: "singleton" } });
  if (settings) {
    await db.churchSettings.update({
      where: { id: "singleton" },
      data: {
        nomeDaIgreja: "ADSA Reimberg",
        nomeDaAplicacao: "ADSA Reimberg Mídias",
        subtitulo: "Central de Mídia ADSA Reimberg",
        textoPrincipal:
          "Artes, fotos e materiais oficiais da ADSA Reimberg, organizados em um só lugar.",
        textoComplementar:
          "Consulte o próximo culto, encontre as versões atualizadas e baixe os materiais necessários para divulgação e utilização na igreja.",
      },
    });
    console.log("[rename] ChurchSettings atualizadas.");
  } else {
    console.log("[rename] ChurchSettings não encontradas — pulando.");
  }

  // 2. Profile admin (atualiza nome se ainda for "Administrador PraiseHub")
  const adminAntigo = await db.profile.findFirst({
    where: { nome: "Administrador PraiseHub" },
  });
  if (adminAntigo) {
    await db.profile.update({
      where: { id: adminAntigo.id },
      data: { nome: "Administrador ADSA Reimberg" },
    });
    console.log(`[rename] Admin ${adminAntigo.email} renomeado.`);
  } else {
    console.log("[rename] Admin já estava com nome novo (ou não existe).");
  }

  // 3. Evento demo: se o pregador for "Pr. Exemplo da Silva" e o local for
  //    "Templo ADSA Praise", atualizar para "Templo ADSA Reimberg"
  const eventosAntigos = await db.event.findMany({
    where: { local: "Templo ADSA Praise" },
  });
  for (const e of eventosAntigos) {
    await db.event.update({
      where: { id: e.id },
      data: { local: "Templo ADSA Reimberg" },
    });
    console.log(`[rename] Evento '${e.nome}' local atualizado.`);
  }

  console.log("[rename] Concluído.");
}

main()
  .catch((err) => {
    console.error("[rename] ERRO:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
