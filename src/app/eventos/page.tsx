import Link from "next/link";
import { db } from "@/lib/db";
import { EventCard } from "@/components/praisehub/event-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Próximos cultos · PraiseHub",
  description: "Consulte os próximos cultos e eventos da ADSA Praise.",
};

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; categoria?: string }>;
}) {
  const sp = await searchParams;
  const busca = sp.busca?.trim();
  const categoria = sp.categoria;

  const where: any = {
    status: "publicado",
    visibilidade: "publico",
  };
  if (busca) {
    where.OR = [
      { nome: { contains: busca } },
      { tema: { contains: busca } },
      { pregador: { contains: busca } },
      { descricao: { contains: busca } },
    ];
  }
  if (categoria) where.categoriaId = categoria;

  const [eventos, categorias] = await Promise.all([
    db.event.findMany({
      where,
      include: { categoria: true },
      orderBy: { data: "asc" },
    }),
    db.eventCategory.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    }),
  ]);

  const agora = new Date();
  const futuros = eventos.filter((e) => new Date(e.data) >= agora);
  const passados = eventos
    .filter((e) => new Date(e.data) < agora)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <div className="praise-container py-8 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="praise-eyebrow">Eventos</p>
        <h1 className="praise-title">Próximos cultos e eventos</h1>
        <p className="praise-subtitle max-w-2xl">
          Consulte datas, horários e materiais oficiais dos próximos eventos da ADSA Praise.
        </p>
      </header>

      {/* Filtros */}
      <form className="mb-8 space-y-3" role="search" aria-label="Filtrar eventos">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="busca" className="sr-only">Buscar por nome, tema ou pregador</label>
          <input
            id="busca"
            name="busca"
            type="search"
            defaultValue={busca ?? ""}
            placeholder="Buscar por nome, tema ou pregador…"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring praise-touch"
          />
          <label htmlFor="categoria" className="sr-only">Filtrar por categoria</label>
          <select
            id="categoria"
            name="categoria"
            defaultValue={categoria ?? ""}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring praise-touch"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <Button type="submit" className="praise-touch">Filtrar</Button>
        </div>
      </form>

      {eventos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-semibold">Nenhum evento encontrado</p>
            <p className="max-w-md text-sm text-muted-foreground">
              {busca || categoria
                ? "Tente ajustar os filtros de busca."
                : "Ainda não há eventos publicados. Volte em breve."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/historico">Ver histórico</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {futuros.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">Próximos</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {futuros.map((e) => (
                  <EventCard key={e.id} evento={e} />
                ))}
              </div>
            </section>
          )}
          {passados.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">Já realizados</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {passados.map((e) => (
                  <EventCard key={e.id} evento={e} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
