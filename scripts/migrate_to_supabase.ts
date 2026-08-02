// Script para migrar schema SQLite → PostgreSQL (Supabase)
// e popular com dados iniciais
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("[migrate] Iniciando migração para Supabase...");

  // 1. Admin padrão
  const senhaPadrao = process.env.PRAISEHUB_ADMIN_PASSWORD || "praisehub2026";
  const senhaHash = await bcrypt.hash(senhaPadrao, 12);

  const adminEmail = "admin@adsapraise.org";
  const admin = await db.profile.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: "Administrador ADSA Reimberg",
      email: adminEmail,
      senhaHash,
      perfil: "administrador",
      status: "ativo",
    },
  });
  console.log(`[migrate] Admin: ${admin.email}`);

  // 2. Configurações da igreja
  await db.churchSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nomeDaIgreja: "ADSA Reimberg",
      nomeDaAplicacao: "ADSA Reimberg Mídias",
      subtitulo: "Central de Mídia ADSA Reimberg",
      textoPrincipal: "Artes, fotos e materiais oficiais da ADSA Reimberg, organizados em um só lugar.",
      textoComplementar: "Consulte o próximo culto, encontre as versões atualizadas e baixe os materiais necessários para divulgação e utilização na igreja.",
      corPrimaria: "#0F2A5C",
      corDestaque: "#C9A227",
      fusoHorario: "America/Sao_Paulo",
      endereco: "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP, 04845-085",
      logo: "/logo-adsa-azul.png",
      icone: "/logo-adsa-transparente.png",
    },
  });
  console.log("[migrate] Configurações da igreja criadas");

  // 3. Categorias
  const categorias = [
    "Culto de Celebração", "Culto da Família", "Santa Ceia",
    "Escola Bíblica Dominical", "Quarta Profética", "Campanha",
    "Evento de Louvor", "ADSA Praise", "ADSA Kids", "CIADSA",
    "JUADSA", "Mulheres", "Jovens", "Crianças", "Conferência",
    "Festividade", "Ensaio", "Comunicado", "Institucional", "Outro",
  ];
  for (let i = 0; i < categorias.length; i++) {
    await db.eventCategory.upsert({
      where: { nome: categorias[i] },
      update: { ordem: i },
      create: { nome: categorias[i], ordem: i, ativo: true },
    });
  }
  console.log(`[migrate] ${categorias.length} categorias criadas`);

  // 4. Horários de cultos
  const cultos = [
    { nome: "Escola Bíblica Dominical (EBD)", diaSemana: 0, horarioInicio: "09:00", horarioFim: "10:30", categoria: "ebd", ordem: 0 },
    { nome: "Celebração da Família", diaSemana: 0, horarioInicio: "18:00", horarioFim: "20:00", categoria: "culto", ordem: 1 },
    { nome: "Terça da Vitória", diaSemana: 2, horarioInicio: "19:30", horarioFim: "21:00", categoria: "culto", ordem: 2 },
    { nome: "Quarta Profética", diaSemana: 3, horarioInicio: "19:30", horarioFim: "21:00", categoria: "culto", ordem: 3 },
  ];
  for (const c of cultos) {
    const existe = await db.serviceSchedule.findFirst({ where: { nome: c.nome } });
    if (!existe) {
      await db.serviceSchedule.create({ data: c });
      console.log(`[migrate] Culto: ${c.nome}`);
    }
  }

  console.log("\n[migrate] Migração concluída com sucesso!");
}

main()
  .catch((err) => {
    console.error("[migrate] ERRO:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
