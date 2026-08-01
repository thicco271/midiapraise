// GET /api/audit - retorna últimos registros de auditoria (admin)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canEditSettings } from "@/lib/session";
import type { ApiResult } from "@/types";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEditSettings(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limiteRaw = Number(searchParams.get("limite") ?? "50");
  const limite = Number.isFinite(limiteRaw) && limiteRaw > 0 ? Math.min(limiteRaw, 200) : 50;

  const logs = await db.auditLog.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite,
    include: { usuario: true },
  });

  return NextResponse.json<ApiResult<any[]>>({
    ok: true,
    data: logs.map((l) => ({
      id: l.id,
      acao: l.acao,
      entidade: l.entidade,
      entidadeId: l.entidadeId,
      descricao: l.descricao,
      criadoEm: l.criadoEm.toISOString(),
      usuario: l.usuario
        ? { id: l.usuario.id, nome: l.usuario.nome, email: l.usuario.email, perfil: l.usuario.perfil }
        : null,
      dadosAnteriores: l.dadosAnteriores,
      dadosPosteriores: l.dadosPosteriores,
    })),
  });
}
