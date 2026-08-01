// PATCH /api/media/[id] - editar metadados da mídia (admin/editor)
// Body: { nome?, observacoes?, textoDeDivulgacao?, visibilidade? }
// DELETE /api/media/[id] - excluir mídia definitivamente (apaga arquivos físicos + registros)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import type { ApiResult } from "@/types";
import fs from "node:fs/promises";
import path from "node:path";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Mídia não encontrada" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const dados: any = { atualizadoEm: new Date() };

  if (typeof body?.nome === "string" && body.nome.trim()) {
    dados.nome = body.nome.trim();
  }
  if (body?.observacoes !== undefined) {
    dados.observacoes = typeof body.observacoes === "string" ? body.observacoes.trim() || null : null;
  }
  if (body?.textoDeDivulgacao !== undefined) {
    dados.textoDeDivulgacao = typeof body.textoDeDivulgacao === "string" ? body.textoDeDivulgacao.trim() || null : null;
  }
  if (typeof body?.visibilidade === "string" && ["publico", "privado"].includes(body.visibilidade)) {
    dados.visibilidade = body.visibilidade;
  }

  const anterior = {
    nome: asset.nome,
    observacoes: asset.observacoes,
    textoDeDivulgacao: asset.textoDeDivulgacao,
    visibilidade: asset.visibilidade,
  };

  const atualizado = await db.mediaAsset.update({
    where: { id },
    data: dados,
  });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "atualizar",
      entidade: "media_asset",
      entidadeId: asset.id,
      descricao: `Mídia '${asset.nome}' editada`,
      dadosAnteriores: JSON.stringify(anterior),
      dadosPosteriores: JSON.stringify(dados),
    },
  });

  return NextResponse.json<ApiResult<{ id: string; nome: string }>>({
    ok: true,
    data: { id: atualizado.id, nome: atualizado.nome },
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  // Apenas administrador pode excluir definitivamente
  if (user.perfil !== "administrador") {
    return NextResponse.json<ApiResult<never>>(
      { ok: false, error: "Apenas administradores podem excluir mídias definitivamente. Use 'Arquivar' para ocultar." },
      { status: 403 },
    );
  }

  const asset = await db.mediaAsset.findUnique({
    where: { id },
    include: { versoes: true, evento: { select: { nome: true } } },
  });
  if (!asset) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Mídia não encontrada" }, { status: 404 });
  }

  // Apaga arquivos físicos (original + thumbnail de cada versão)
  const publicDir = path.join(process.cwd(), "public");
  const arquivosApagados: string[] = [];
  const arquivosFalha: string[] = [];

  for (const versao of asset.versoes) {
    // Arquivo principal
    if (versao.caminhoDoArquivo) {
      const rel = versao.caminhoDoArquivo.startsWith("/")
        ? versao.caminhoDoArquivo.slice(1)
        : versao.caminhoDoArquivo;
      const abs = path.join(publicDir, rel);
      try {
        await fs.unlink(abs);
        arquivosApagados.push(versao.caminhoDoArquivo);
      } catch (err: any) {
        if (err?.code !== "ENOENT") {
          arquivosFalha.push(versao.caminhoDoArquivo);
          console.warn("[delete-media] Falha ao apagar:", abs, err.message);
        }
      }
    }
    // Thumbnail
    if (versao.caminhoThumbnail) {
      const rel = versao.caminhoThumbnail.startsWith("/")
        ? versao.caminhoThumbnail.slice(1)
        : versao.caminhoThumbnail;
      const abs = path.join(publicDir, rel);
      try {
        await fs.unlink(abs);
        arquivosApagados.push(versao.caminhoThumbnail);
      } catch (err: any) {
        if (err?.code !== "ENOENT") {
          arquivosFalha.push(versao.caminhoThumbnail);
        }
      }
    }
  }

  // Tenta limpar diretórios vazios (thumbs/, tipo/, evento/)
  const eventoDir = path.dirname(path.dirname(path.join(publicDir, asset.versoes[0]?.caminhoDoArquivo?.replace(/^\//, "") ?? "")));
  for (const dir of [path.join(eventoDir, "thumbs"), eventoDir]) {
    try {
      const entries = await fs.readdir(dir);
      if (entries.length === 0) {
        await fs.rmdir(dir);
      }
    } catch {
      // diretorio não existe ou não está vazio - tudo bem
    }
  }

  // Apaga registros do banco (cascade apaga versões)
  await db.mediaAsset.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "excluir",
      entidade: "media_asset",
      entidadeId: asset.id,
      descricao: `Mídia '${asset.nome}' excluída do evento '${asset.evento.nome}' (${asset.versoes.length} versão(ões), ${arquivosApagados.length} arquivo(s) físico(s) apagado(s))`,
      dadosAnteriores: JSON.stringify({
        nome: asset.nome,
        tipo: asset.tipo,
        status: asset.status,
        versoes: asset.versoes.length,
        eventoId: asset.eventoId,
      }),
      dadosPosteriores: JSON.stringify({ arquivosApagados, arquivosFalha }),
    },
  });

  return NextResponse.json<ApiResult<{ id: string; apagados: number }>>({
    ok: true,
    data: { id: asset.id, apagados: arquivosApagados.length },
  });
}
