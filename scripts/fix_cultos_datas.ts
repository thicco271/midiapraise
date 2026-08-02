// Apaga cultos com datas erradas e cria com datas corretas
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const admin = await db.profile.findFirst({ where: { perfil: "administrador" } });
  if (!admin) { console.log("Admin não encontrado"); return; }

  const endereco = "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP";
  const local = "Templo ADSA Reimberg";

  // Apagar TODOS os cultos existentes (vamos recriar com datas corretas)
  console.log("[fix] Apagando todos os eventos existentes...");
  await db.mediaAsset.deleteMany({});
  await db.album.deleteMany({});
  await db.event.deleteMany({});
  console.log("[fix] Eventos apagados.");

  // Buscar categorias
  const catEBD = await db.eventCategory.findUnique({ where: { nome: "Escola Bíblica Dominical" } });
  const catFamilia = await db.eventCategory.findUnique({ where: { nome: "Culto da Família" } });
  const catCelebracao = await db.eventCategory.findUnique({ where: { nome: "Culto de Celebração" } });
  const catQuarta = await db.eventCategory.findUnique({ where: { nome: "Quarta Profética" } });

  // Datas corretas (hoje é 02/08/2026 = domingo)
  const cultos = [
    // HOJE 02/08 (domingo) — Celebração 18h (EBD 09h já passou)
    {
      nome: "Celebração da Família",
      categoriaId: catFamilia?.id ?? catCelebracao?.id ?? null,
      data: new Date("2026-08-02T18:00:00-03:00"),
      horarioInicio: "18:00",
      horarioFim: "20:00",
      tema: "Famílias que adoram juntos",
      versiculo: "Salmo 133:1",
      descricao: "Culto de celebração para toda a família da ADSA Reimberg.",
    },
    // Terça 04/08 — Terça da Vitória 19h30
    {
      nome: "Terça da Vitória",
      categoriaId: catQuarta?.id ?? null, // não temos categoria Terça, usar Quarta Profética
      data: new Date("2026-08-04T19:30:00-03:00"),
      horarioInicio: "19:30",
      horarioFim: "21:00",
      tema: "Vitória em Cristo",
      descricao: "Culto de oração e vitória toda terça-feira.",
    },
    // Quarta 05/08 — Quarta Profética 19h30
    {
      nome: "Quarta Profética",
      categoriaId: catQuarta?.id ?? null,
      data: new Date("2026-08-05T19:30:00-03:00"),
      horarioInicio: "19:30",
      horarioFim: "21:00",
      tema: "Palavra profética para a semana",
      descricao: "Culto profético toda quarta-feira.",
    },
    // Domingo 09/08 — EBD 09h + Celebração 18h
    {
      nome: "Escola Bíblica Dominical (EBD)",
      categoriaId: catEBD?.id ?? null,
      data: new Date("2026-08-09T09:00:00-03:00"),
      horarioInicio: "09:00",
      horarioFim: "10:30",
      tema: "Estudo da Palavra",
      descricao: "Escola Bíblica Dominical — estudo sistemático da Palavra de Deus.",
    },
    {
      nome: "Celebração da Família",
      categoriaId: catFamilia?.id ?? catCelebracao?.id ?? null,
      data: new Date("2026-08-09T18:00:00-03:00"),
      horarioInicio: "18:00",
      horarioFim: "20:00",
      tema: "Famílias que adoram juntos",
      versiculo: "Salmo 133:1",
      descricao: "Culto de celebração para toda a família da ADSA Reimberg.",
    },
    // Terça 11/08
    {
      nome: "Terça da Vitória",
      categoriaId: catQuarta?.id ?? null,
      data: new Date("2026-08-11T19:30:00-03:00"),
      horarioInicio: "19:30",
      horarioFim: "21:00",
      tema: "Vitória em Cristo",
      descricao: "Culto de oração e vitória toda terça-feira.",
    },
    // Quarta 12/08
    {
      nome: "Quarta Profética",
      categoriaId: catQuarta?.id ?? null,
      data: new Date("2026-08-12T19:30:00-03:00"),
      horarioInicio: "19:30",
      horarioFim: "21:00",
      tema: "Palavra profética para a semana",
      descricao: "Culto profético toda quarta-feira.",
    },
  ];

  let count = 0;
  for (const c of cultos) {
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
    count++;
    console.log(`[fix] Criado: ${c.nome} — ${c.data.toISOString()}`);
  }

  console.log(`\n[fix] Total: ${count} cultos criados`);

  // Listar final
  const todos = await db.event.findMany({
    where: { status: "publicado" },
    orderBy: { data: "asc" },
    select: { nome: true, data: true },
  });
  console.log("\n[fix] TODOS OS EVENTOS:");
  for (const e of todos) {
    const dia = new Date(e.data).toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' });
    console.log(`  ${e.data.toISOString().substring(0,16)} | ${dia} | ${e.nome}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
