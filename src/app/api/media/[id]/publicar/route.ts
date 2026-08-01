// PATCH /api/media/[id]/publicar - marca asset como publicado (admin)
// Body: { status: "publicado" | "rascunho" | "arquivado" }
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import type { ApiResult } from "@/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageEvents(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const status = String(body?.status ?? "publicado");
  if (!["rascunho", "publicado", "arquivado"].includes(status)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Status inválido" }, { status: 400 });
  }

  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Mídia não encontrada" }, { status: 404 });
  }

  const dados: any = { status, atualizadoEm: new Date() };
  if (status === "publicado" && !asset.publicadoEm) {
    dados.publicadoEm = new Date();
  }

  const atualizado = await db.mediaAsset.update({
    where: { id },
    data: dados,
  });

  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: status === "publicado" ? "publicar" : status === "arquivado" ? "arquivar" : "atualizar",
      entidade: "media_asset",
      entidadeId: asset.id,
      descricao: `Status do arquivo '${asset.nome}' alterado para '${status}'`,
      dadosAnteriores: JSON.stringify({ status: asset.status }),
      dadosPosteriores: JSON.stringify({ status }),
    },
  });

  return NextResponse.json<ApiResult<{ id: string; status: string }>>({
    ok: true,
    data: { id: atualizado.id, status: atualizado.status },
  });
}
