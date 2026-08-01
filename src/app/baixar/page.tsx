import Link from "next/link";
import { db } from "@/lib/db";
import {
  formatarData,
  formatarDataLonga,
  diaDaSemana,
  formatarHorario,
  selecionarProximoCulto,
} from "@/lib/praise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  ChevronRight,
  CalendarHeart,
  Sparkles,
  History,
} from "lucide-react";

export const metadata = {
  title: "Baixar artes · ADSA Reimberg Mídias",
  description:
    "Selecione um culto e baixe as artes oficiais (WhatsApp, redes sociais, banner/telão). Não é preciso登录.",
};

async function getDados() {
  const eventos = await db.event.findMany({
    where: {
      status: "publicado",
      visibilidade: "publico",
    },
    include: {
      categoria: true,
      mediaAssets: {
        where: { status: "publicado" },
        select: { id: true, tipo: true, quantidadeDownloads: true },
      },
    },
    orderBy: { data: "asc" },
  });

  const agora = new Date();
  const proximoCulto = selecionarProximoCulto(eventos, agora);

  // Próximos (futuros publicados)
  const proximos = eventos
    .filter((e) => new Date(e.data) >= agora)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  // Anteriores (já realizados)
  const anteriores = eventos
    .filter((e) => new Date(e.data) < agora)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return { proximoCulto, proximos, anteriores };
}

function contarArquivos(mediaAssets: any[]): number {
  return mediaAssets.length;
}

interface EventoLista {
  id: string;
  nome: string;
  slug: string;
  data: Date;
  horarioInicio: string;
  local: string | null;
  categoria: { nome: string } | null;
  mediaAssets: any[];
  destaqueManual: boolean;
}

function EventoCard({ e, destaque }: { e: EventoLista; destaque?: boolean }) {
  const totalArquivos = contarArquivos(e.mediaAssets);
  return (
    <Card
      className={`praise-card flex flex-col gap-0 overflow-hidden transition-shadow hover:shadow-md ${
        destaque ? "ring-2 ring-praise-gold/40" : ""
      }`}
    >
      <CardHeader className="space-y-1 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="praise-eyebrow">
              {e.categoria?.nome ?? "Evento"}
              {destaque && (
                <Badge variant="outline" className="ml-2 border-0 bg-praise-gold/20 text-praise-gold">
                  <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                  Próximo
                </Badge>
              )}
            </p>
            <CardTitle className="mt-1 text-lg">{e.nome}</CardTitle>
          </div>
          {totalArquivos > 0 && (
            <Badge variant="outline" className="border-0 bg-emerald-100 text-emerald-700">
              {totalArquivos} arquivo{totalArquivos === 1 ? "" : "s"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pb-3">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-praise-gold" aria-hidden="true" />
            <span className="capitalize">{diaDaSemana(e.data)}</span>
            <span aria-hidden="true">·</span>
            <span>{formatarData(e.data)}</span>
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-praise-gold" aria-hidden="true" />
            {formatarHorario(e.horarioInicio)}
          </p>
          {e.local && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-praise-gold" aria-hidden="true" />
              <span className="line-clamp-1">{e.local}</span>
            </p>
          )}
        </div>

        <Button asChild size="sm" className="mt-auto praise-touch">
          <Link href={`/baixar/${e.slug}`}>
            <Download className="h-4 w-4" />
            {totalArquivos > 0 ? "Ver e baixar artes" : "Ver página do culto"}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function BaixarPage() {
  const { proximoCulto, proximos, anteriores } = await getDados();

  // Total = soma de assets de todos os eventos (sem duplicar próximo culto)
  const todosEventos = [...proximos, ...anteriores];
  const totalArquivos = todosEventos.reduce(
    (acc, e: any) => acc + (e.mediaAssets?.length ?? 0),
    0,
  );

  return (
    <div className="praise-container py-8 sm:py-12">
      <header className="mb-8 space-y-3">
        <p className="praise-eyebrow">Download de artes</p>
        <h1 className="praise-title">Baixar materiais oficiais</h1>
        <p className="praise-subtitle max-w-2xl">
          Selecione um culto abaixo para ver e baixar as artes oficiais (WhatsApp, redes sociais e banner/telão).
          Não é preciso fazer login — todos os materiais publicados são públicos.
        </p>
        {totalArquivos > 0 && (
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">{totalArquivos}</strong> arquivo{totalArquivos === 1 ? "" : "s"} público{totalArquivos === 1 ? "" : "s"} disponíve{totalArquivos === 1 ? "l" : "is"} no momento.
          </p>
        )}
      </header>

      {/* Próximo culto em destaque */}
      {proximoCulto && (
        <section className="mb-10" aria-labelledby="destaque-titulo">
          <h2 id="destaque-titulo" className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
            <CalendarHeart className="h-5 w-5 text-praise-gold" aria-hidden="true" />
            Próximo culto
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <EventoCard e={proximoCulto as any} destaque />
          </div>
        </section>
      )}

      {/* Próximos programados */}
      {proximos.length > 1 && (
        <section className="mb-10" aria-labelledby="proximos-titulo">
          <h2 id="proximos-titulo" className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
            <Calendar className="h-5 w-5 text-praise-gold" aria-hidden="true" />
            Próximos programados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proximos
              .filter((e: any) => !e.destaqueManual || e.id !== proximoCulto?.id)
              .map((e: any) => (
                <EventoCard key={e.id} e={e} />
              ))}
          </div>
        </section>
      )}

      {/* Anteriores */}
      {anteriores.length > 0 && (
        <section aria-labelledby="anteriores-titulo">
          <h2 id="anteriores-titulo" className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
            <History className="h-5 w-5 text-praise-gold" aria-hidden="true" />
            Cultos anteriores
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {anteriores.slice(0, 12).map((e: any) => (
              <EventoCard key={e.id} e={e} />
            ))}
          </div>
          {anteriores.length > 12 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando os 12 mais recentes.{" "}
              <Link href="/historico" className="text-primary hover:underline">
                Ver histórico completo
              </Link>
            </p>
          )}
        </section>
      )}

      {/* Empty state */}
      {!proximoCulto && proximos.length === 0 && anteriores.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-semibold">Nenhum culto publicado</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Ainda não há eventos com materiais públicos. Volte em breve.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
