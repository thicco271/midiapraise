// GET /api/admin/backup/historico - lista operações de backup/restore (auditoria)
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.perfil !== "administrador") {
    return NextResponse.json({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const logs = await db.auditLog.findMany({
    where: { entidade: "backup" },
    orderBy: { criadoEm: "desc" },
    take: 50,
    include: { usuario: { select: { nome: true, email: true } } },
  });

  return NextResponse.json({
    ok: true,
    data: logs.map((l) => ({
      id: l.id,
      acao: l.acao,
      descricao: l.descricao,
      criadoEm: l.criadoEm.toISOString(),
      usuario: l.usuario ? { nome: l.usuario.nome, email: l.usuario.email } : null,
      dadosPosteriores: l.dadosPosteriores,
    })),
  });
}
