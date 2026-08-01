import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { EventForm } from "@/components/praisehub/event-form";

export const metadata = { title: "Editar evento · PraiseHub Admin" };

async function getDados(id: string) {
  const [evento, categorias] = await Promise.all([
    db.event.findUnique({
      where: { id },
      include: { categoria: true, criadoPor: true, atualizadoPor: true },
    }),
    db.eventCategory.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    }),
  ]);
  return { evento, categorias };
}

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { evento, categorias } = await getDados(id);
  if (!evento) notFound();

  const categoriasDTO = categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    icone: c.icone,
    ativo: c.ativo,
    ordem: c.ordem,
  }));

  // Serializar para o cliente
  const eventoDTO = {
    id: evento.id,
    nome: evento.nome,
    slug: evento.slug,
    categoriaId: evento.categoriaId ?? "",
    descricao: evento.descricao ?? "",
    data: evento.data.toISOString(),
    horarioInicio: evento.horarioInicio,
    horarioFim: evento.horarioFim ?? "",
    local: evento.local ?? "",
    endereco: evento.endereco ?? "",
    tema: evento.tema ?? "",
    versiculo: evento.versiculo ?? "",
    pregador: evento.pregador ?? "",
    ministerio: evento.ministerio ?? "",
    capa: evento.capa ?? "",
    status: evento.status,
    visibilidade: evento.visibilidade,
    destaqueManual: evento.destaqueManual,
    observacoesInternas: evento.observacoesInternas ?? "",
  };

  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6">
          <p className="praise-eyebrow">Administração</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Editar evento</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Editando <strong>{evento.nome}</strong>
          </p>
        </header>
        <EventForm categorias={categoriasDTO} eventoExistente={eventoDTO} />
      </div>
    </AdminGuard>
  );
}
