// GET    /api/events/[id]  -> detalhe (por id ou slug)
// PATCH  /api/events/[id]  -> atualizar (admin/editor)
// DELETE /api/events/[id]  -> excluir (lógico por padrão, definitivo com ?definitivo=true)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import { uniqueSlug } from "@/lib/praise";
import type { ApiResult, EventDTO, ProfileDTO } from "@/types";
import fs from "node:fs/promises";
import path from "node:path";

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

async function buscarPorIdOuSlug(id: string) {
  // Tenta por id primeiro, depois por slug
  const porId = await db.event.findUnique({
    where: { id },
    include: { categoria: true, criadoPor: true, atualizadoPor: true },
  });
  if (porId) return porId;
  return db.event.findUnique({
    where: { slug: id },
    include: { categoria: true, criadoPor: true, atualizadoPor: true },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await buscarPorIdOuSlug(id);
  if (!evento) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Evento não encontrado" }, { status: 404 });
  }

  // Aplicar regras de visibilidade
  const user = await getCurrentUser();
  const autenticado = !!user;
  if (evento.status !== "publicado" || evento.visibilidade === "privado") {
    if (!autenticado || !canManageEvents(user!.perfil)) {
      if (evento.status !== "publicado" || evento.visibilidade !== "publico") {
        return NextResponse.json<ApiResult<never>>({ ok: false, error: "Evento não disponível" }, { status: 403 });
      }
    }
  }
  return NextResponse.json<ApiResult<EventDTO>>({ ok: true, data: mapEvent(evento) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const existente = await buscarPorIdOuSlug(id);
  if (!existente) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Evento não encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const dados: any = { atualizadoPorId: user.id };

  if (typeof body?.nome === "string" && body.nome.trim() && body.nome !== existente.nome) {
    dados.nome = body.nome.trim();
    dados.slug = await uniqueSlug(
      dados.nome,
      async (s) => !!(await db.event.findFirst({ where: { slug: s, NOT: { id: existente.id } } })),
    );
  }
  if (body?.categoriaId !== undefined) dados.categoriaId = body.categoriaId || null;
  if (typeof body?.descricao === "string") dados.descricao = body.descricao || null;
  if (typeof body?.data === "string" && body.data) {
    // Interpretar YYYY-MM-DD como data local combinada com horarioInicio
    const m = body.data.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [_, y, mo, d] = m;
      const hh = String(body?.horarioInicio ?? existente.horarioInicio ?? "19:30").split(":");
      dados.data = new Date(Number(y), Number(mo) - 1, Number(d), Number(hh[0]) || 19, Number(hh[1]) || 30);
    } else {
      const d = new Date(body.data);
      if (!Number.isNaN(d.getTime())) dados.data = d;
    }
  }
  if (typeof body?.horarioInicio === "string") dados.horarioInicio = body.horarioInicio;
  if (body?.horarioFim !== undefined) dados.horarioFim = body.horarioFim || null;
  if (typeof body?.local === "string") dados.local = body.local || null;
  if (typeof body?.endereco === "string") dados.endereco = body.endereco || null;
  if (typeof body?.tema === "string") dados.tema = body.tema || null;
  if (typeof body?.versiculo === "string") dados.versiculo = body.versiculo || null;
  if (typeof body?.pregador === "string") dados.pregador = body.pregador || null;
  if (typeof body?.ministerio === "string") dados.ministerio = body.ministerio || null;
  if (typeof body?.capa === "string") dados.capa = body.capa || null;
  if (typeof body?.visibilidade === "string") dados.visibilidade = body.visibilidade;
  if (typeof body?.status === "string") {
    dados.status = body.status;
    if (body.status === "publicado" && !existente.publicadoEm) {
      dados.publicadoEm = new Date();
    }
  }
  if (typeof body?.destaqueManual === "boolean") dados.destaqueManual = body.destaqueManual;
  if (typeof body?.observacoesInternas === "string") dados.observacoesInternas = body.observacoesInternas || null;

  const anterior = {
    nome: existente.nome,
    data: existente.data,
    status: existente.status,
    visibilidade: existente.visibilidade,
    destaqueManual: existente.destaqueManual,
  };

  const atualizado = await db.event.update({
    where: { id: existente.id },
    data: dados,
    include: { categoria: true, criadoPor: true, atualizadoPor: true },
  });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "atualizar",
      entidade: "evento",
      entidadeId: atualizado.id,
      descricao: `Evento '${atualizado.nome}' atualizado`,
      dadosAnteriores: JSON.stringify(anterior),
      dadosPosteriores: JSON.stringify(dados),
    },
  });

  return NextResponse.json<ApiResult<EventDTO>>({ ok: true, data: mapEvent(atualizado) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const existente = await buscarPorIdOuSlug(id);
  if (!existente) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Evento não encontrado" }, { status: 404 });
  }

  // Verifica se é exclusão definitiva (definitivo=true) ou apenas arquivar (padrão)
  const { searchParams } = new URL(req.url);
  const definitivo = searchParams.get("definitivo") === "true";

  // Apenas administrador pode excluir definitivamente
  if (definitivo && user.perfil !== "administrador") {
    return NextResponse.json<ApiResult<never>>(
      { ok: false, error: "Apenas administradores podem excluir definitivamente. Use arquivar." },
      { status: 403 },
    );
  }

  if (definitivo) {
    // EXCLUSÃO DEFINITIVA — apaga tudo vinculado ao evento
    // 1. Apaga arquivos físicos das mídias
    const medias = await db.mediaAsset.findMany({
      where: { eventoId: existente.id },
      include: { versoes: true },
    });

    let arquivosApagados = 0;
    for (const media of medias) {
      for (const versao of media.versoes) {
        for (const caminho of [versao.caminhoDoArquivo, versao.caminhoThumbnail]) {
          if (!caminho) continue;
          const rel = caminho.startsWith("/") ? caminho.slice(1) : caminho;
          const abs = path.join(process.cwd(), "public", rel);
          try {
            await fs.unlink(abs);
            arquivosApagados++;
          } catch (err: any) {
            if (err?.code !== "ENOENT") console.warn("[delete-event] Falha:", abs);
          }
        }
      }
    }

    // 2. Apaga registros (cascade apaga versões)
    await db.mediaAsset.deleteMany({ where: { eventoId: existente.id } });

    // 3. Apaga álbuns vinculados (e suas fotos via cascade)
    const albuns = await db.album.findMany({
      where: { eventoId: existente.id },
      include: { fotos: true },
    });
    for (const album of albuns) {
      for (const foto of album.fotos) {
        for (const caminho of [foto.caminhoOriginal, foto.caminhoOtimizado, foto.caminhoThumbnail]) {
          if (!caminho) continue;
          const rel = caminho.startsWith("/") ? caminho.slice(1) : caminho;
          const abs = path.join(process.cwd(), "public", rel);
          try {
            await fs.unlink(abs);
            arquivosApagados++;
          } catch (err: any) {
            if (err?.code !== "ENOENT") console.warn("[delete-event] Falha:", abs);
          }
        }
      }
    }
    await db.album.deleteMany({ where: { eventoId: existente.id } });

    // 4. Apaga o evento
    await db.event.delete({ where: { id: existente.id } });

    await db.auditLog.create({
      data: {
        usuarioId: user.id,
        acao: "excluir",
        entidade: "evento",
        entidadeId: existente.id,
        descricao: `Evento '${existente.nome}' excluído definitivamente (${medias.length} mídia(s), ${albuns.length} álbum(ns), ${arquivosApagados} arquivo(s) apagado(s))`,
        dadosAnteriores: JSON.stringify({
          nome: existente.nome,
          status: existente.status,
          medias: medias.length,
          albuns: albuns.length,
        }),
      },
    });

    return NextResponse.json<ApiResult<{ id: string; definitivo: true; arquivos: number }>>({
      ok: true,
      data: { id: existente.id, definitivo: true, arquivos: arquivosApagados },
    });
  }

  // EXCLUSÃO LÓGICA (padrão) — apenas arquiva
  const arquivado = await db.event.update({
    where: { id: existente.id },
    data: { status: "arquivado", atualizadoPorId: user.id },
  });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "arquivar",
      entidade: "evento",
      entidadeId: arquivado.id,
      descricao: `Evento '${arquivado.nome}' arquivado`,
      dadosAnteriores: JSON.stringify({ status: existente.status }),
      dadosPosteriores: JSON.stringify({ status: "arquivado" }),
    },
  });

  return NextResponse.json<ApiResult<{ id: string; status: string }>>({
    ok: true,
    data: { id: arquivado.id, status: arquivado.status },
  });
}
