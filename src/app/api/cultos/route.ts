// GET  /api/cultos - lista horários de cultos
// POST /api/cultos - cria (admin)
// PATCH /api/cultos - atualiza em lote (admin)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canEditSettings } from "@/lib/session";
import type { ApiResult } from "@/types";

const DIAS_NOMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export async function GET() {
  const cultos = await db.serviceSchedule.findMany({
    where: { ativo: true },
    orderBy: [{ diaSemana: "asc" }, { horarioInicio: "asc" }],
  });
  return NextResponse.json<ApiResult<any[]>>({
    ok: true,
    data: cultos.map((c) => ({
      id: c.id,
      nome: c.nome,
      diaSemana: c.diaSemana,
      diaNome: DIAS_NOMES[c.diaSemana] ?? "—",
      horarioInicio: c.horarioInicio,
      horarioFim: c.horarioFim,
      categoria: c.categoria,
      descricao: c.descricao,
      ativo: c.ativo,
      ordem: c.ordem,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEditSettings(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }
  const body = await req.json();
  const nome = String(body?.nome ?? "").trim();
  if (!nome) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Nome é obrigatório" }, { status: 400 });
  }
  const diaSemana = Number(body?.diaSemana);
  if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Dia da semana inválido (0-6)" }, { status: 400 });
  }
  if (!body?.horarioInicio) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Horário de início obrigatório" }, { status: 400 });
  }

  const novo = await db.serviceSchedule.create({
    data: {
      nome,
      diaSemana,
      horarioInicio: String(body.horarioInicio),
      horarioFim: body.horarioFim || null,
      categoria: body.categoria || null,
      descricao: body.descricao || null,
      ordem: Number(body.ordem ?? 0),
      ativo: body.ativo !== false,
    },
  });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "criar",
      entidade: "service_schedule",
      entidadeId: novo.id,
      descricao: `Culto '${novo.nome}' criado`,
    },
  });

  return NextResponse.json<ApiResult<any>>({ ok: true, data: novo }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEditSettings(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }
  const body = await req.json();
  // Body: { cultos: [{id, nome, diaSemana, horarioInicio, horarioFim, categoria, descricao, ativo, ordem}] }
  if (!Array.isArray(body?.cultos)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Esperado array 'cultos'" }, { status: 400 });
  }

  const existentes = await db.serviceSchedule.findMany({ select: { id: true } });
  const idsExistentes = new Set(existentes.map((e) => e.id));

  for (const c of body.cultos) {
    if (!c.id || !idsExistentes.has(c.id)) continue;
    await db.serviceSchedule.update({
      where: { id: c.id },
      data: {
        nome: String(c.nome ?? ""),
        diaSemana: Number(c.diaSemana ?? 0),
        horarioInicio: String(c.horarioInicio ?? "19:30"),
        horarioFim: c.horarioFim || null,
        categoria: c.categoria || null,
        descricao: c.descricao || null,
        ativo: c.ativo !== false,
        ordem: Number(c.ordem ?? 0),
      },
    });
  }

  return NextResponse.json<ApiResult<{ atualizados: number }>>({
    ok: true,
    data: { atualizados: body.cultos.length },
  });
}
