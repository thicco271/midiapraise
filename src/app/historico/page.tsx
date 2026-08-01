import Link from "next/link";
import { db } from "@/lib/db";
import { formatarData } from "@/lib/praise";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ChevronLeft } from "lucide-react";
import { AnoFiltro } from "@/components/praisehub/ano-filtro";

export const metadata = {
  title: "Histórico de cultos · PraiseHub",
  description: "Consulte os cultos e eventos anteriores da ADSA Praise.",
};

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; busca?: string }>;
}) {
  const sp = await searchParams;
  const anoRaw = sp.ano;
  const busca = sp.busca?.trim();
  const ano = anoRaw ? Number(anoRaw) : NaN;

  const where: any = {
    status: "publicado",
    visibilidade: "publico",
  };
  if (Number.isFinite(ano)) {
    const inicio = new Date(ano, 0, 1);
    const fim = new Date(ano + 1, 0, 1);
    where.data = { gte: inicio, lt: fim };
  }
  if (busca) {
    where.OR = [
      { nome: { contains: busca } },
      { tema: { contains: busca } },
      { pregador: { contains: busca } },
    ];
  }

  const [eventos, todos] = await Promise.all([
    db.event.findMany({
      where,
      include: { categoria: true },
      orderBy: { data: "desc" },
    }),
    db.event.findMany({
      where: { status: "publicado", visibilidade: "publico" },
      select: { data: true },
    }),
  ]);

  const anos = Array.from(
    new Set(todos.map((e) => new Date(e.data).getFullYear())),
  ).sort((a, b) => b - a);

  // Agrupar por mês/ano
  const grupos = new Map<string, typeof eventos>();
  for (const e of eventos) {
    const d = new Date(e.data);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(e);
  }

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  return (
    <div className="praise-container py-8 sm:py-12">
      <header className="mb-6 space-y-2">
        <p className="praise-eyebrow">Histórico</p>
        <h1 className="praise-title">Cultos anteriores</h1>
        <p className="praise-subtitle max-w-2xl">
          Consulte eventos já realizados. Materiais e álbuns continuam acessíveis pelos links.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="flex flex-1 gap-2" role="search" aria-label="Buscar no histórico">
          <label htmlFor="busca" className="sr-only">Buscar</label>
          <input
            id="busca"
            name="busca"
            type="search"
            defaultValue={busca ?? ""}
            placeholder="Buscar por nome, tema ou pregador…"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring praise-touch"
          />
          <Button type="submit" className="praise-touch">Buscar</Button>
        </form>

        <div className="flex items-center gap-2">
          <label htmlFor="ano" className="text-sm text-muted-foreground">Ano:</label>
          <AnoFiltro anos={anos} anoAtual={Number.isFinite(ano) ? ano : undefined} />
        </div>
      </div>

      {eventos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <History className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-semibold">Nenhum evento encontrado</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/eventos">
                <ChevronLeft className="h-4 w-4" />
                Ver próximos cultos
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Array.from(grupos.entries()).map(([chave, lista]) => {
            const [anoStr, mesStr] = chave.split("-");
            const mes = Number(mesStr) - 1;
            return (
              <section key={chave}>
                <h2 className="mb-3 border-b border-border pb-1 text-lg font-bold capitalize text-foreground">
                  {nomesMeses[mes]} de {anoStr}
                </h2>
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {lista.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/eventos/${e.slug}`}
                        className="flex flex-col gap-1 bg-card p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4"
                      >
                        <div className="flex w-32 shrink-0 items-center gap-2 text-sm text-muted-foreground">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                            {String(new Date(e.data).getDate()).padStart(2, "0")}
                          </span>
                          <span>{formatarData(e.data, { month: "short" })}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-foreground">{e.nome}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {e.categoria?.nome ?? "Evento"}
                            {e.pregador ? ` · ${e.pregador}` : ""}
                          </p>
                        </div>
                        <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
