export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/lib/db";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { CultosManager } from "@/components/praisehub/cultos-manager";

export const metadata = { title: "Horários de cultos · ADSA Reimberg Mídias Admin" };

async function getCultos() {
  return db.serviceSchedule.findMany({
    orderBy: [{ diaSemana: "asc" }, { horarioInicio: "asc" }],
  });
}

export default async function AdminCultosPage() {
  const cultos = await getCultos();
  const cultosDTO = cultos.map((c) => ({
    id: c.id,
    nome: c.nome,
    diaSemana: c.diaSemana,
    horarioInicio: c.horarioInicio,
    horarioFim: c.horarioFim ?? "",
    categoria: c.categoria ?? "",
    descricao: c.descricao ?? "",
    ativo: c.ativo,
    ordem: c.ordem,
  }));

  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6">
          <p className="praise-eyebrow">Administração</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Horários de cultos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os horários regulares exibidos publicamente. Cultos especiais devem ser criados como eventos em /admin/eventos.
          </p>
        </header>
        <CultosManager cultosIniciais={cultosDTO} />
      </div>
    </AdminGuard>
  );
}
