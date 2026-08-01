// GET  /api/events?status=&visivel=&busca=&categoria=&limite=
// POST /api/events  -> criar evento (admin/editor)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import { slugify, uniqueSlug } from "@/lib/praise";
import type { ApiResult, EventDTO, ProfileDTO } from "@/types";

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
    criadoPor: e.criadoPor
      ? {
          id: e.criadoPor.id,
          nome: e.criadoPor.nome,
          email: e.criadoPor.email,
          avatar: e.criadoPor.avatar,
          perfil: e.criadoPor.perfil as ProfileDTO["perfil"],
          status: e.criadoPor.status,
          ultimoAcesso: e.criadoPor.ultimoAcesso?.toISOString() ?? null,
          criadoEm: e.criadoPor.criadoEm.toISOString(),
        }
      : null,
    atualizadoPor: e.atualizadoPor
      ? {
          id: e.atualizadoPor.id,
          nome: e.atualizadoPor.nome,
          email: e.atualizadoPor.email,
          avatar: e.atualizadoPor.avatar,
          perfil: e.atualizadoPor.perfil,
          status: e.atualizadoPor.status,
          ultimoAcesso: e.atualizadoPor.ultimoAcesso?.toISOString() ?? null,
          criadoEm: e.atualizadoPor.criadoEm.toISOString(),
        }
      : null,
    criadoEm: e.criadoEm instanceof Date ? e.criadoEm.toISOString() : e.criadoEm,
    atualizadoEm: e.atualizadoEm instanceof Date ? e.atualizadoEm.toISOString() : e.atualizadoEm,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const visivel = searchParams.get("visivel");
  const busca = searchParams.get("busca")?.trim();
  const categoria = searchParams.get("categoria");
  const limiteRaw = Number(searchParams.get("limite") ?? "0");
  const limite = Number.isFinite(limiteRaw) && limiteRaw > 0 ? Math.min(limiteRaw, 200) : undefined;
  const ordenacao = searchParams.get("ordem") ?? "data_asc";

  const user = await getCurrentUser();
  const autenticado = !!user;

  const where: any = {};
  if (status) where.status = status;
  if (categoria) where.categoriaId = categoria;
  if (busca) {
    where.OR = [
      { nome: { contains: busca } },
      { tema: { contains: busca } },
      { pregador: { contains: busca } },
      { descricao: { contains: busca } },
    ];
  }

  // Aplicar regras de visibilidade pública
  if (!autenticado) {
    where.AND = [{ status: "publicado" }, { visibilidade: "publico" }];
  } else if (!canManageEvents(user!.perfil)) {
    where.AND = [
      {
        OR: [
          { visibilidade: "publico" },
          { visibilidade: "somente_autenticados" },
          { visibilidade: "somente_equipe" },
        ],
      },
    ];
  }

  let orderBy: any = { data: "asc" };
  if (ordenacao === "data_desc") orderBy = { data: "desc" };
  else if (ordenacao === "criado_desc") orderBy = { criadoEm: "desc" };
  else if (ordenacao === "nome_asc") orderBy = { nome: "asc" };

  const eventos = await db.event.findMany({
    where,
    orderBy,
    ...(limite ? { take: limite } : {}),
    include: {
      categoria: true,
      criadoPor: true,
      atualizadoPor: true,
    },
  });

  if (visivel === "publicos") {
    // Mantém apenas publicados (atalho p/ páginas públicas)
    const filtrados = eventos.filter((e) => e.status === "publicado");
    return NextResponse.json<ApiResult<EventDTO[]>>({ ok: true, data: filtrados.map(mapEvent) });
  }

  return NextResponse.json<ApiResult<EventDTO[]>>({ ok: true, data: eventos.map(mapEvent) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const nome = String(body?.nome ?? "").trim();
  if (!nome) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Nome do evento é obrigatório" }, { status: 400 });
  }

  const dataStr = String(body?.data ?? "").trim();
  if (!dataStr) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Data é obrigatória" }, { status: 400 });
  }
  // Interpretar YYYY-MM-DD como data local (não UTC) e combinar com horarioInicio
  let data: Date;
  const m = dataStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [_, y, mo, d] = m;
    const hh = String(body?.horarioInicio ?? "19:30").split(":");
    data = new Date(Number(y), Number(mo) - 1, Number(d), Number(hh[0]) || 19, Number(hh[1]) || 30);
  } else {
    data = new Date(dataStr);
  }
  if (Number.isNaN(data.getTime())) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Data inválida" }, { status: 400 });
  }

  const horarioInicio = String(body?.horarioInicio ?? "19:30").trim();
  const slug = await uniqueSlug(nome, async (s) => !!(await db.event.findUnique({ where: { slug: s } })));

  const novo = await db.event.create({
    data: {
      nome,
      slug,
      categoriaId: body?.categoriaId || null,
      descricao: body?.descricao || null,
      data,
      horarioInicio,
      horarioFim: body?.horarioFim || null,
      local: body?.local || null,
      endereco: body?.endereco || null,
      tema: body?.tema || null,
      versiculo: body?.versiculo || null,
      pregador: body?.pregador || null,
      ministerio: body?.ministerio || null,
      capa: body?.capa || null,
      status: body?.status || "rascunho",
      visibilidade: body?.visibilidade || "publico",
      destaqueManual: !!body?.destaqueManual,
      observacoesInternas: body?.observacoesInternas || null,
      criadoPorId: user.id,
      atualizadoPorId: user.id,
      ...(body?.status === "publicado" ? { publicadoEm: new Date() } : {}),
    },
    include: { categoria: true, criadoPor: true, atualizadoPor: true },
  });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "criar",
      entidade: "evento",
      entidadeId: novo.id,
      descricao: `Evento '${novo.nome}' criado`,
      dadosPosteriores: JSON.stringify({ nome: novo.nome, slug: novo.slug, status: novo.status }),
    },
  });

  return NextResponse.json<ApiResult<EventDTO>>({ ok: true, data: mapEvent(novo) }, { status: 201 });
}
