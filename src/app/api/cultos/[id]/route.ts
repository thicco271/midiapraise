// DELETE /api/cultos/[id] - exclui horário de culto (admin)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canEditSettings } from "@/lib/session";
import type { ApiResult } from "@/types";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canEditSettings(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }
  const culto = await db.serviceSchedule.findUnique({ where: { id } });
  if (!culto) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Culto não encontrado" }, { status: 404 });
  }
  await db.serviceSchedule.delete({ where: { id } });
  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "excluir",
      entidade: "service_schedule",
      entidadeId: culto.id,
      descricao: `Culto '${culto.nome}' excluído`,
    },
  });
  return NextResponse.json<ApiResult<{ id: string }>>({ ok: true, data: { id: culto.id } });
}
