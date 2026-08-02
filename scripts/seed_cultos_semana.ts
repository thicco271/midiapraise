// Cria cultos para ESTA SEMANA (03/08 a 09/08/2026)
// baseado nos horários regulares da igreja
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const admin = await db.profile.findFirst({ where: { perfil: "administrador" } });
  if (!admin) { console.log("Admin não encontrado"); return; }

  const endereco = "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP";
  const local = "Templo ADSA Reimberg";

  // Buscar categorias
  const catCelebracao = await db.eventCategory.findUnique({ where: { nome: "Culto de Celebração" } });
  const catFamilia = await db.eventCategory.findUnique({ where: { nome: "Culto da Família" } });
  const catTerca = await db.eventCategory.findUnique({ where: { nome: "Quarta Profética" } });
  const catQuarta = await db.eventCategory.findUnique({ where: { nome: "Quarta Profética" } });
  const catEBD = await db.eventCategory.findUnique({ where: { nome: "Escola Bíblica Dominical" } });

  // Cultos para esta semana (hoje é 02/08 sábado)
  const cultos = [
    // Domingo 03/08 — EBD 09h + Celebração 18h
    {
      nome: "Escola Bíblica Dominical (EBD)",
      categoriaId: catEBD?.id ?? null,
      data: new Date("2026-08-03T09:00:00-03:00"),
      horarioInicio: "09:00",
      horarioFim: "10:30",
      tema: "Estudo da Palavra",
      descricao: "Escola Bíblica Dominical — estudo sistemático da Palavra de Deus.",
    },
    {
      nome: "Celebração da Família",
      categoriaId: catFamilia?.id ?? catCelebracao?.id ?? null,
      data: new Date("2026-08-03T18:00:00-03:00"),
      horarioInicio: "18:00",
      horarioFim: "20:00",
      tema: "Famílias que adoram juntos",
      versiculo: "Salmo 133:1",
      descricao: "Culto de celebração para toda a família da ADSA Reimberg.",
    },
    // Terça 05/08 — Terça da Vitória 19h30
    {
      nome: "Terça da Vitória",
      categoriaId: catTerca?.id ?? null,
      data: new Date("2026-08-05T19:30:00-03:00"),
      horarioInicio: "19:30",
      horarioFim: "21:00",
      tema: "Vitória em Cristo",
      descricao: "Culto de oração e vitória toda terça-feira.",
    },
    // Quarta 06/08 — Quarta Profética 19h30
    {
      nome: "Quarta Profética",
      categoriaId: catQuarta?.id ?? null,
      data: new Date("2026-08-06T19:30:00-03:00"),
      horarioInicio: "19:30",
      horarioFim: "21:00",
      tema: "Palavra profética para a semana",
      descricao: "Culto profético toda quarta-feira.",
    },
  ];

  let criados = 0;
  let atualizados = 0;

  for (const c of cultos) {
    // Verifica se já existe evento com mesmo nome E mesma data (±1 dia)
    const existe = await db.event.findFirst({
      where: {
        nome: c.nome,
        data: {
          gte: new Date(c.data.getTime() - 86400000),
          lte: new Date(c.data.getTime() + 86400000),
        },
      },
    });

    if (existe) {
      console.log(`[seed] Já existe: ${c.nome} (${c.data.toISOString()}) — pulando`);
      continue;
    }

    const slug = c.nome.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
      + "-" + c.data.toISOString().slice(0, 10);

    await db.event.create({
      data: {
        ...c,
        slug,
        local,
        endereco,
        status: "publicado",
        visibilidade: "publico",
        publicadoEm: new Date(),
        criadoPorId: admin.id,
        atualizadoPorId: admin.id,
      },
    });
    criados++;
    console.log(`[seed] Criado: ${c.nome} para ${c.data.toISOString()}`);
  }

  console.log(`\n[seed] Total: ${criados} criados, ${atualizados} atualizados`);

  // Listar todos os eventos
  const todos = await db.event.findMany({
    where: { status: "publicado" },
    orderBy: { data: "asc" },
    select: { nome: true, data: true },
  });
  console.log("\n[seed] TODOS OS EVENTOS PUBLICADOS:");
  for (const e of todos) {
    console.log(`  ${e.data.toISOString().substring(0,16)} | ${e.nome}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
