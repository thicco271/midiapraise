// GET /api/dashboard - dados agregados para o dashboard administrativo
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canAccessAdmin } from "@/lib/session";
import { selecionarProximoCulto, semanaAtual } from "@/lib/praise";
import type { ApiResult, DashboardData, EventDTO } from "@/types";

function mapEvent(e: any): EventDTO {
  return {
    id: e.id,
    nome: e.nome,
    slug: e.slug,
    categoriaId: e.categoriaId,
    categoria: e.categoria
      ? {
          id: e.categoria.id,
          nome: e.categoria.nome,
          icone: e.categoria.icone,
          ativo: e.categoria.ativo,
          ordem: e.categoria.ordem,
        }
      : null,
    descricao: e.descricao,
    data: e.data instanceof Date ? e.data.toISOString() : e.data,
    horarioInicio: e.horarioInicio,
    horarioFim: e.horarioFim,
    local: e.local,
    endereco: e.endereco,
    tema: e.tema,
    versiculo: e.versiculo,
    pregador: e.pregador,
    ministerio: e.ministerio,
    capa: e.capa,
    status: e.status,
    visibilidade: e.visibilidade,
    destaqueManual: e.destaqueManual,
    publicadoEm: e.publicadoEm instanceof Date ? e.publicadoEm.toISOString() : e.publicadoEm,
    observacoesInternas: e.observacoesInternas,
    criadoPorId: e.criadoPorId,
    criadoEm: e.criadoEm instanceof Date ? e.criadoEm.toISOString() : e.criadoEm,
    atualizadoEm: e.atualizadoEm instanceof Date ? e.atualizadoEm.toISOString() : e.atualizadoEm,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const { inicio, fim } = semanaAtual();
  const agora = new Date();

  const [todos, daSemana, ultimos] = await Promise.all([
    db.event.findMany({
      where: { status: { not: "arquivado" } },
      include: { categoria: true },
      orderBy: { data: "asc" },
    }),
    db.event.findMany({
      where: {
        data: { gte: inicio, lte: fim },
        status: { not: "arquivado" },
      },
      include: { categoria: true },
      orderBy: { data: "asc" },
    }),
    db.event.findMany({
      orderBy: { criadoEm: "desc" },
      take: 10,
      include: { categoria: true },
    }),
  ]);

  const publicados = todos.filter((e) => e.status === "publicado");
  const semArte = todos.filter((e) => !e.capa && e.status !== "cancelado");
  const proximoCulto = selecionarProximoCulto(publicados, agora);

  const data: DashboardData = {
    proximoCulto: proximoCulto ? mapEvent(proximoCulto) : null,
    eventosDaSemana: daSemana.map(mapEvent),
    eventosSemArte: semArte.slice(0, 10).map(mapEvent),
    ultimosEventos: ultimos.map(mapEvent),
    totalEventos: todos.length,
    totalPublicados: publicados.length,
    totalRascunhos: todos.filter((e) => e.status === "rascunho").length,
  };

  return NextResponse.json<ApiResult<DashboardData>>({ ok: true, data });
}
