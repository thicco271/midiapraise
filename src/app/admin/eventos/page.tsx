import Link from "next/link";
import { db } from "@/lib/db";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";
import { AdminEventList } from "@/components/praisehub/admin-event-list";

export const metadata = { title: "Gerenciar eventos · ADSA Reimberg Mídias Admin" };

async function getEventos() {
  return db.event.findMany({
    where: { status: { not: "arquivado" } },
    include: { categoria: true, criadoPor: true },
    orderBy: [{ data: "asc" }],
  });
}

async function getCategorias() {
  return db.eventCategory.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
}

export default async function AdminEventosPage() {
  const [eventos, categorias] = await Promise.all([getEventos(), getCategorias()]);

  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="praise-eyebrow">Administração</p>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Eventos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {eventos.length} evento{eventos.length === 1 ? "" : "s"} ativo{eventos.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button asChild className="praise-touch">
            <Link href="/admin/eventos/novo">
              <Plus className="h-4 w-4" />
              Novo culto
            </Link>
          </Button>
        </header>

        <AdminEventList eventos={eventos.map((e) => ({
          id: e.id,
          nome: e.nome,
          slug: e.slug,
          categoriaNome: e.categoria?.nome ?? "—",
          data: e.data.toISOString(),
          horarioInicio: e.horarioInicio,
          status: e.status as any,
          destaqueManual: e.destaqueManual,
          criadoPorNome: e.criadoPor?.nome ?? "—",
        }))} />

        {eventos.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <p className="text-lg font-semibold">Nenhum evento ainda</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Comece criando o primeiro culto da ADSA Reimberg.
              </p>
              <Button asChild>
                <Link href="/admin/eventos/novo">
                  <Plus className="h-4 w-4" />
                  Criar primeiro evento
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminGuard>
  );
}
