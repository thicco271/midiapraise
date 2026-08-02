export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/lib/db";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { BackupManager } from "@/components/praisehub/backup-manager";
import { formatarData } from "@/lib/praise";

export const metadata = { title: "Backup · ADSA Reimberg Mídias Admin" };

async function getHistorico() {
  const logs = await db.auditLog.findMany({
    where: { entidade: "backup" },
    orderBy: { criadoEm: "desc" },
    take: 20,
    include: { usuario: { select: { nome: true, email: true } } },
  });
  return logs.map((l) => ({
    id: l.id,
    acao: l.acao,
    descricao: l.descricao,
    criadoEm: l.criadoEm.toISOString(),
    usuario: l.usuario ? { nome: l.usuario.nome } : null,
  }));
}

export default async function AdminBackupPage() {
  const historico = await getHistorico();

  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6">
          <p className="praise-eyebrow">Administração</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Backup & Restauração</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Baixe um backup completo (banco de dados + arquivos) ou restaure de um backup anterior.
          </p>
        </header>

        <BackupManager historico={historico} />
      </div>
    </AdminGuard>
  );
}
