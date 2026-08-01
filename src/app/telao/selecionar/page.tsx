"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Monitor,
  ChevronRight,
  Calendar,
  Clock,
  Image as ImageIcon,
  CalendarHeart,
} from "lucide-react";
import { formatarData, formatarHorario, diaDaSemana } from "@/lib/praise";

interface EventoTelao {
  id: string;
  nome: string;
  slug: string;
  data: string;
  dataFormatada: string;
  horarioInicio: string;
  categoria: string | null;
  temBannerTelao: boolean;
  totalBanners: number;
}

export default function TelaoSelecionarPage() {
  const [eventos, setEventos] = useState<EventoTelao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/telao/eventos")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok) setEventos(body.data);
        else setErro(body?.error ?? "Falha ao carregar");
      })
      .catch(() => setErro("Falha na comunicação"))
      .finally(() => setLoading(false));
  }, []);

  const agora = new Date();
  const proximos = eventos.filter((e) => new Date(e.data) >= agora);
  const anteriores = eventos.filter((e) => new Date(e.data) < agora);

  return (
    <div className="praise-container py-8 sm:py-12">
      <header className="mb-8 space-y-3">
        <p className="praise-eyebrow">Projeção</p>
        <h1 className="praise-title">Modo Telão</h1>
        <p className="praise-subtitle max-w-2xl">
          Selecione um culto para exibir a arte de telão em tela cheia.
          Se o culto não tiver arte publicada, será exibida uma tela branca com as informações do evento.
        </p>
        <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">💡 Como usar:</p>
          <ul className="mt-1 space-y-0.5">
            <li>• Clique em um culto abaixo para abrir o modo telão</li>
            <li>• Pressione <kbd className="rounded bg-background px-1">F</kbd> para tela cheia</li>
            <li>• Use <kbd className="rounded bg-background px-1">←</kbd> <kbd className="rounded bg-background px-1">→</kbd> para navegar entre imagens</li>
            <li>• <kbd className="rounded bg-background px-1">Espaço</kbd> pausa/retoma a rotação automática</li>
          </ul>
        </div>
      </header>

      {/* Próximo culto (atalho rápido) */}
      <div className="mb-8">
        <Button asChild size="lg" className="w-full praise-touch">
          <Link href="/telao">
            <CalendarHeart className="h-5 w-5" />
            Abrir telão do próximo culto
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : erro ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-8 text-center text-sm text-destructive">
            {erro}
          </CardContent>
        </Card>
      ) : eventos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Monitor className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-semibold">Nenhum culto publicado</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Ainda não há eventos publicados para exibir no telão.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Próximos */}
          {proximos.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                <Calendar className="h-5 w-5 text-praise-gold" aria-hidden="true" />
                Próximos cultos
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {proximos.map((e) => (
                  <EventoCard key={e.id} evento={e} />
                ))}
              </div>
            </section>
          )}

          {/* Anteriores */}
          {anteriores.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                <Calendar className="h-5 w-5 text-praise-gold" aria-hidden="true" />
                Cultos anteriores
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {anteriores.slice(0, 12).map((e) => (
                  <EventoCard key={e.id} evento={e} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EventoCard({ evento }: { evento: EventoTelao }) {
  return (
    <Link
      href={`/telao?evento=${evento.slug}`}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-praise-gold">
            {evento.categoria ?? "Evento"}
          </p>
          <p className="mt-1 line-clamp-2 font-semibold text-foreground">{evento.nome}</p>
        </div>
        {evento.temBannerTelao ? (
          <Badge variant="outline" className="border-0 bg-emerald-100 text-emerald-700 shrink-0">
            <ImageIcon className="mr-1 h-3 w-3" aria-hidden="true" />
            {evento.totalBanners}
          </Badge>
        ) : (
          <Badge variant="outline" className="border-0 bg-muted text-muted-foreground shrink-0">
            Sem arte
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" aria-hidden="true" />
        <span className="capitalize">{diaDaSemana(evento.data)}</span>
        <span aria-hidden="true">·</span>
        <span>{evento.dataFormatada}</span>
        <span aria-hidden="true">·</span>
        <Clock className="h-3 w-3" aria-hidden="true" />
        {formatarHorario(evento.horarioInicio)}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {evento.temBannerTelao ? "Abrir com arte" : "Abrir tela branca"}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </Link>
  );
}
