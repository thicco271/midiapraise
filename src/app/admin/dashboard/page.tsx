export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { db } from "@/lib/db";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { DashboardClient } from "@/components/praisehub/dashboard-client";
import {
  selecionarProximoCulto,
  formatarData,
  diaDaSemana,
  formatarHorario,
} from "@/lib/praise";
import {
  Calendar,
  Clock,
  ImageIcon,
  LayoutDashboard,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function getDashboard() {
  const agora = new Date();
  const inicio = new Date(agora);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(agora);
  fim.setDate(fim.getDate() + 7);

  const [todos, daSemana, ultimos] = await Promise.all([
    db.event.findMany({
      where: { status: { not: "arquivado" } },
      include: { categoria: true },
      orderBy: { data: "asc" },
    }),
    db.event.findMany({
      where: {
        data: { gte: inicio, lte: fim },
        status: { not: "arquivado" },
      },
      include: { categoria: true },
      orderBy: { data: "asc" },
    }),
    db.event.findMany({
      orderBy: { criadoEm: "desc" },
      take: 8,
      include: { categoria: true },
    }),
  ]);

  const publicados = todos.filter((e) => e.status === "publicado");
  const semArte = todos.filter((e) => !e.capa && e.status !== "cancelado");
  const proximoCulto = selecionarProximoCulto(publicados, agora);

  return {
    proximoCulto,
    daSemana,
    semArte: semArte.slice(0, 6),
    ultimos,
    totalEventos: todos.length,
    totalPublicados: publicados.length,
    totalRascunhos: todos.filter((e) => e.status === "rascunho").length,
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboard();

  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="praise-eyebrow">Painel administrativo</p>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Visão geral dos eventos, materiais e atividades da semana.
            </p>
          </div>
          <Button asChild className="praise-touch">
            <Link href="/admin/eventos/novo">
              <Plus className="h-4 w-4" />
              Novo culto
            </Link>
          </Button>
        </header>

        {/* Cards de resumo */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total de eventos", valor: data.totalEventos, icon: Calendar, accent: "text-primary" },
            { label: "Publicados", valor: data.totalPublicados, icon: LayoutDashboard, accent: "text-emerald-600" },
            { label: "Em rascunho", valor: data.totalRascunhos, icon: ImageIcon, accent: "text-amber-600" },
            { label: "Sem capa", valor: data.semArte.length, icon: AlertCircle, accent: "text-orange-600" },
          ].map((c) => (
            <Card key={c.label} className="praise-card">
              <CardContent className="flex items-center gap-3 p-4">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted ${c.accent}`}>
                  <c.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold leading-none">{c.valor}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Próximo culto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximo culto em destaque</CardTitle>
              <CardDescription>
                Definido automaticamente (publicado + mais próximo) ou por destaque manual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.proximoCulto ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="praise-eyebrow">
                        {data.proximoCulto.categoria?.nome ?? "Evento"}
                      </p>
                      <h3 className="text-xl font-bold">{data.proximoCulto.nome}</h3>
                    </div>
                    {data.proximoCulto.destaqueManual && (
                      <span className="rounded-full bg-praise-gold/20 px-2 py-0.5 text-xs font-medium text-praise-gold">
                        Destaque manual
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                      <span className="capitalize">{diaDaSemana(data.proximoCulto.data)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatarData(data.proximoCulto.data)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                      {formatarHorario(data.proximoCulto.horarioInicio)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/eventos/${data.proximoCulto.slug}`}>Ver página pública</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/admin/eventos/${data.proximoCulto.id}`}>Editar evento</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nenhum culto publicado. Crie um evento e publique para exibi-lo na página inicial.
                  <div className="mt-3">
                    <Button asChild size="sm">
                      <Link href="/admin/eventos/novo">
                        <Plus className="h-4 w-4" />
                        Criar culto
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Eventos da semana */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Esta semana</CardTitle>
              <CardDescription>Próximos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {data.daSemana.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum evento nesta semana.</p>
              ) : (
                <ul className="space-y-2">
                  {data.daSemana.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/admin/eventos/${e.id}`}
                        className="flex items-center justify-between gap-2 rounded-md border border-border bg-card p-2 text-sm transition-colors hover:bg-muted/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{e.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatarData(e.data)} · {formatarHorario(e.horarioInicio)}
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          {e.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pendências + recentes */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eventos sem capa</CardTitle>
              <CardDescription>Precisando de arte de destaque</CardDescription>
            </CardHeader>
            <CardContent>
              {data.semArte.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tudo certo! Todos os eventos possuem capa.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.semArte.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/admin/eventos/${e.id}`}
                        className="flex items-center justify-between gap-2 rounded p-2 text-sm hover:bg-muted/50"
                      >
                        <span className="truncate">{e.nome}</span>
                        <span className="text-xs text-muted-foreground">{formatarData(e.data)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atividade recente</CardTitle>
              <CardDescription>Últimos eventos criados ou editados</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {data.ultimos.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/admin/eventos/${e.id}`}
                      className="flex items-center justify-between gap-2 rounded p-2 text-sm hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate">{e.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatarData(e.criadoEm)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                        {e.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <DashboardClient />
      </div>
    </AdminGuard>
  );
}
