// Script para:
// 1. Remover destaqueManual do Culto da Família
// 2. Criar eventos publicados para os próximos cultos reais
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  console.log("[fix] Removendo destaque manual de TODOS os eventos…");
  await db.event.updateMany({
    where: { destaqueManual: true },
    data: { destaqueManual: false },
  });

  // Buscar categoria Culto da Família
  const catFamilia = await db.eventCategory.findUnique({ where: { nome: "Culto da Família" } });
  const catTerca = await db.eventCategory.findUnique({ where: { nome: "Quarta Profética" } });
  // Quarta Profética é a categoria, mas o culto é terça da vitória
  const catCelebracao = await db.eventCategory.findUnique({ where: { nome: "Culto de Celebração" } });
  const catEBD = await db.eventCategory.findUnique({ where: { nome: "Escola Bíblica Dominical" } });
  const catQuarta = await db.eventCategory.findUnique({ where: { nome: "Quarta Profética" } });

  // Próximas datas (2026-08-02 é hoje)
  // Domingo 09/08: Celebração da Família 18h + EBD 09h
  // Terça 11/08: Terça da Vitória 19h30
  // Quarta 12/08: Quarta Profética 19h30
  // Domingo 16/08: Celebração da Família + EBD
  // Terça 18/08: Terça da Vitória
  // Quarta 19/08: Quarta Profética

  const adminId = (await db.profile.findFirst({ where: { perfil: "administrador" } }))?.id;

  const eventosParaCriar = [
    {
      nome: "Celebração da Família",
      categoriaId: catFamilia?.id ?? catCelebracao?.id ?? null,
      data: new Date("2026-08-09T18:00:00-03:00"),
      horarioInicio: "18:00",
      horarioFim: "20:00",
      local: "Templo ADSA Reimberg",
      endereco: "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP",
      tema: "Famílias que adoram juntos",
      versiculo: "Salmo 133:1",
      pregador: "Pr. a definir",
      ministerio: "Pastoral",
      descricao: "Culto de celebração para toda a família da ADSA Reimberg.",
    },
    {
      nome: "Terça da Vitória",
      categoriaId: catTerca?.id ?? null,
      data: new Date("2026-08-11T19:30:00-03:00"),
      horarioInicio: "19:30",
      horarioFim: "21:00",
      local: "Templo ADSA Reimberg",
      endereco: "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP",
      tema: "Vitória em Cristo",
      pregador: "Pr. a definir",
      ministerio: "Pastoral",
      descricao: "Culto de oração e vitória toda terça-feira.",
    },
    {
      nome: "Quarta Profética",
      categoriaId: catQuarta?.id ?? null,
      data: new Date("2026-08-12T19:30:00-03:00"),
      horarioInicio: "19:30",
      horarioFim: "21:00",
      local: "Templo ADSA Reimberg",
      endereco: "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP",
      tema: "Palavra profética para a semana",
      pregador: "Pr. a definir",
      ministerio: "Pastoral",
      descricao: "Culto profético toda quarta-feira.",
    },
  ];

  for (const ev of eventosParaCriar) {
    // Verifica se já existe evento com mesmo nome e data
    const existe = await db.event.findFirst({
      where: {
        nome: ev.nome,
        data: { gte: new Date(ev.data.getTime() - 86400000), lte: new Date(ev.data.getTime() + 86400000) },
      },
    });
    if (existe) {
      console.log(`[fix] Já existe: ${ev.nome} (${ev.data.toISOString()}) — atualizando...`);
      await db.event.update({
        where: { id: existe.id },
        data: {
          ...ev,
          status: "publicado",
          visibilidade: "publico",
          publicadoEm: existe.publicadoEm ?? new Date(),
          atualizadoPorId: adminId,
        },
      });
    } else {
      const slug = ev.nome.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
        + "-" + ev.data.toISOString().slice(0, 10);
      const criado = await db.event.create({
        data: {
          ...ev,
          slug,
          status: "publicado",
          visibilidade: "publico",
          publicadoEm: new Date(),
          criadoPorId: adminId,
          atualizadoPorId: adminId,
        },
      });
      console.log(`[fix] Criado: ${criado.nome} para ${criado.data.toISOString()} (slug: ${slug})`);
    }
  }

  // Apagar o antigo "Culto da Família" demo (que tem data 22:30 horário errado)
  const antigo = await db.event.findFirst({
    where: {
      nome: "Culto da Família",
      data: new Date("2026-08-09T22:30:00.000Z"),
    },
  });
  if (antigo) {
    console.log(`[fix] Apagando culto antigo demo (${antigo.data.toISOString()})...`);
    // Apagar mídias vinculadas
    await db.mediaAsset.deleteMany({ where: { eventoId: antigo.id } });
    await db.album.deleteMany({ where: { eventoId: antigo.id } });
    await db.event.delete({ where: { id: antigo.id } });
    console.log("[fix] Culto demo antigo apagado.");
  }

  // Listar final
  const finais = await db.event.findMany({
    where: { status: "publicado" },
    orderBy: { data: "asc" },
    select: { nome: true, data: true, destaqueManual: true, status: true },
  });
  console.log("\n[fix] EVENTOS PUBLICADOS FINAIS:");
  for (const e of finais) {
    console.log(`  ${e.data.toISOString().substring(0,16)} | destaque=${e.destaqueManual} | ${e.nome}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
