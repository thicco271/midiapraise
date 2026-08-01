import { db } from "@/lib/db";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { EventForm } from "@/components/praisehub/event-form";

export const metadata = { title: "Novo culto · ADSA Reimberg Mídias Admin" };

async function getCategorias() {
  return db.eventCategory.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
}

export default async function NovoEventoPage() {
  const categorias = await getCategorias();
  const categoriasDTO = categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    icone: c.icone,
    ativo: c.ativo,
    ordem: c.ordem,
  }));

  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6">
          <p className="praise-eyebrow">Administração</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Novo culto</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha as informações. Você pode salvar como rascunho e publicar depois.
          </p>
        </header>
        <EventForm categorias={categoriasDTO} />
      </div>
    </AdminGuard>
  );
}
