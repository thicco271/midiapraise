// PraiseHub - Seed inicial
// Cria: admin padrão, categorias iniciais, configurações da igreja.
// Idempotente: pode ser executado várias vezes.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("[seed] Iniciando seed do PraiseHub…");

  // 1. Admin padrão
  const senhaPadrao = process.env.PRAISEHUB_ADMIN_PASSWORD || "praisehub2026";
  const senhaHash = await bcrypt.hash(senhaPadrao, 12);

  const adminEmail = "admin@adsapraise.org";
  const admin = await db.profile.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: "Administrador PraiseHub",
      email: adminEmail,
      senhaHash,
      perfil: "administrador",
      status: "ativo",
    },
  });
  console.log(`[seed] Admin: ${admin.email} (senha padrão: ${senhaPadrao})`);

  // 2. Configurações da igreja
  await db.churchSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nomeDaIgreja: "ADSA Praise",
      nomeDaAplicacao: "PraiseHub",
      subtitulo: "Central de Mídia ADSA Praise",
      textoPrincipal:
        "Artes, fotos e materiais oficiais da ADSA Praise, organizados em um só lugar.",
      textoComplementar:
        "Consulte o próximo culto, encontre as versões atualizadas e baixe os materiais necessários para divulgação e utilização na igreja.",
      corPrimaria: "#0F2A5C",
      corDestaque: "#C9A227",
      fusoHorario: "America/Sao_Paulo",
    },
  });
  console.log("[seed] Configurações da igreja criadas.");

  // 3. Categorias iniciais
  const categorias = [
    "Culto de Celebração",
    "Culto da Família",
    "Santa Ceia",
    "Escola Bíblica Dominical",
    "Quarta Profética",
    "Campanha",
    "Evento de Louvor",
    "ADSA Praise",
    "ADSA Kids",
    "CIADSA",
    "JUADSA",
    "Mulheres",
    "Jovens",
    "Crianças",
    "Conferência",
    "Festividade",
    "Ensaio",
    "Comunicado",
    "Institucional",
    "Outro",
  ];

  for (let i = 0; i < categorias.length; i++) {
    const nome = categorias[i];
    await db.eventCategory.upsert({
      where: { nome },
      update: { ordem: i },
      create: { nome, ordem: i, ativo: true },
    });
  }
  console.log(`[seed] ${categorias.length} categorias criadas.`);

  // 4. Evento de demonstração (publicado, data futura)
  const slugExistente = await db.event.findUnique({ where: { slug: "culto-da-familia-2026-08-09" } });
  if (!slugExistente) {
    const catFamilia = await db.eventCategory.findUnique({ where: { nome: "Culto da Família" } });
    const dataEvento = new Date("2026-08-09T19:30:00-03:00");
    await db.event.create({
      data: {
        nome: "Culto da Família",
        slug: "culto-da-familia-2026-08-09",
        categoriaId: catFamilia?.id,
        descricao:
          "Uma noite especial de adoração e gratidão pelas famílias da ADSA Praise. Venha celebrar conosco!",
        data: dataEvento,
        horarioInicio: "19:30",
        horarioFim: "21:30",
        local: "Templo ADSA Praise",
        endereco: "Av. Exemplo, 1000 - São Paulo/SP",
        tema: "Famílias que adoram juntos",
        versiculo: "Salmo 133:1",
        pregador: "Pr. Exemplo da Silva",
        ministerio: "Pastoral",
        status: "publicado",
        visibilidade: "publico",
        destaqueManual: true,
        publicadoEm: new Date(),
        criadoPorId: admin.id,
        atualizadoPorId: admin.id,
      },
    });
    console.log("[seed] Evento demo 'Culto da Família' criado.");
  }

  console.log("[seed] Seed concluído com sucesso.");
}

main()
  .catch((err) => {
    console.error("[seed] ERRO:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
