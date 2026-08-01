import Link from "next/link";
import { db } from "@/lib/db";
import {
  selecionarProximoCulto,
  formatarData,
  formatarDataLonga,
  diaDaSemana,
  formatarHorario,
  semanaAtual,
} from "@/lib/praise";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventCard } from "@/components/praisehub/event-card";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Download,
  Copy,
  ChevronRight,
  ImageIcon,
  History,
  Sparkles,
  CalendarHeart,
} from "lucide-react";
import { CopyLinkButton } from "@/components/praisehub/copy-link-button";

async function getDadosIniciais() {
  const [settings, eventos] = await Promise.all([
    db.churchSettings.findUnique({ where: { id: "singleton" } }),
    db.event.findMany({
      where: {
        status: "publicado",
        visibilidade: "publico",
      },
      include: { categoria: true },
      orderBy: { data: "asc" },
    }),
  ]);

  const agora = new Date();
  const proximoCulto = selecionarProximoCulto(eventos, agora);

  const { inicio, fim } = semanaAtual();
  const daSemana = eventos.filter((e) => {
    const d = new Date(e.data);
    return d >= inicio && d <= fim;
  });

  const ultimos = [...eventos]
    .filter((e) => new Date(e.data) < agora)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 3);

  return { settings, proximoCulto, daSemana, ultimos };
}

export default async function HomePage() {
  const { settings, proximoCulto, daSemana, ultimos } = await getDadosIniciais();

  const subtitulo = settings?.subtitulo ?? "Central de Mídia ADSA Reimberg";
  const textoPrincipal =
    settings?.textoPrincipal ??
    "Artes, fotos e materiais oficiais da ADSA Reimberg, organizados em um só lugar.";
  const textoComplementar =
    settings?.textoComplementar ??
    "Consulte o próximo culto, encontre as versões atualizadas e baixe os materiais necessários para divulgação e utilização na igreja.";

  return (
    <div className="flex flex-col">
      {/* HERO + Próximo culto */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/95 via-primary to-[#091E45] text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-praise-gold blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white blur-3xl" />
        </div>

        <div className="praise-container relative py-10 sm:py-14 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Coluna texto */}
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-praise-gold/40 bg-praise-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-praise-gold">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Fonte oficial · ADSA Reimberg
              </p>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {subtitulo}
              </h1>
              <p className="max-w-prose text-base text-primary-foreground/85 sm:text-lg">
                {textoPrincipal}
              </p>
              <p className="max-w-prose text-sm text-primary-foreground/70 sm:text-base">
                {textoComplementar}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild size="lg" className="praise-touch">
                  <Link href={proximoCulto ? `/eventos/${proximoCulto.slug}` : "/eventos"}>
                    <CalendarHeart className="h-4 w-4" />
                    Ver próximo culto
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-praise-gold/40 bg-transparent text-primary-foreground hover:bg-praise-gold/10 hover:text-primary-foreground praise-touch"
                >
                  <Link href="/eventos">
                    <ImageIcon className="h-4 w-4" />
                    Ver artes
                  </Link>
                </Button>
              </div>
            </div>

            {/* Card do próximo culto */}
            <div className="lg:pl-6">
              {proximoCulto ? (
                <Card className="overflow-hidden border-praise-gold/30 bg-white text-foreground shadow-2xl">
                  {proximoCulto.capa ? (
                     
                    <img
                      src={proximoCulto.capa}
                      alt={`Capa do ${proximoCulto.nome}`}
                      className="aspect-[16/9] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-primary/10 to-praise-gold/10">
                      <Calendar className="h-12 w-12 text-primary/40" aria-hidden="true" />
                    </div>
                  )}
                  <CardHeader>
                    <p className="praise-eyebrow">
                      {proximoCulto.categoria?.nome ?? "Próximo culto"}
                    </p>
                    <CardTitle className="text-2xl">{proximoCulto.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                      <span className="capitalize">{diaDaSemana(proximoCulto.data)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatarData(proximoCulto.data)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                      <span>{formatarHorario(proximoCulto.horarioInicio)}</span>
                      {proximoCulto.horarioFim && (
                        <>
                          <span aria-hidden="true">–</span>
                          <span>{formatarHorario(proximoCulto.horarioFim)}</span>
                        </>
                      )}
                    </div>
                    {proximoCulto.local && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                        <span>{proximoCulto.local}</span>
                      </div>
                    )}
                    {proximoCulto.pregador && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                        <span>{proximoCulto.pregador}</span>
                      </div>
                    )}
                    {proximoCulto.tema && (
                      <div className="flex items-start gap-2 pt-2">
                        <BookOpen className="mt-0.5 h-4 w-4 text-praise-gold" aria-hidden="true" />
                        <span className="italic">{proximoCulto.tema}</span>
                      </div>
                    )}
                  </CardContent>
                  <div className="flex flex-wrap gap-2 border-t border-border bg-muted/30 px-4 py-3">
                    <Button asChild size="sm" className="praise-touch">
                      <Link href={`/eventos/${proximoCulto.slug}`}>
                        Ver materiais
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="praise-touch"
                    >
                      <Link href={`/eventos/${proximoCulto.slug}?baixar=1`}>
                        <Download className="h-4 w-4" />
                        Baixar artes
                      </Link>
                    </Button>
                    <CopyLinkButton
                      url={`/eventos/${proximoCulto.slug}`}
                      label="Copiar link"
                      size="sm"
                      variant="ghost"
                    />
                  </div>
                </Card>
              ) : (
                <Card className="border-dashed bg-white/95 text-foreground shadow-xl">
                  <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                    <p className="text-lg font-semibold">Agenda em atualização</p>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      Não há culto futuro publicado no momento. Volte em breve ou consulte o histórico.
                    </p>
                    <Button asChild size="sm" variant="outline" className="praise-touch">
                      <Link href="/historico">
                        <History className="h-4 w-4" />
                        Ver histórico
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Atalhos */}
      <section className="border-b border-border bg-background py-8">
        <div className="praise-container">
          <h2 className="sr-only">Atalhos principais</h2>
          <nav
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            aria-label="Atalhos principais"
          >
            {[
              { href: proximoCulto ? `/eventos/${proximoCulto.slug}` : "/eventos", label: "Próximo culto", icon: CalendarHeart },
              { href: "/eventos", label: "Artes oficiais", icon: ImageIcon },
              { href: "/eventos", label: "Banner e telão", icon: Download },
              { href: "/historico", label: "Histórico", icon: History },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Conteúdo da semana */}
      <section className="py-10">
        <div className="praise-container space-y-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="praise-eyebrow">Conteúdo da semana</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Próximos eventos</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/eventos">
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {daSemana.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {daSemana.map((e) => (
                <EventCard key={e.id} evento={e} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                <Calendar className="h-8 w-8 opacity-40" aria-hidden="true" />
                Não há eventos publicados para esta semana.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Últimos cultos */}
      {ultimos.length > 0 && (
        <section className="border-t border-border bg-secondary/30 py-10">
          <div className="praise-container space-y-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="praise-eyebrow">Histórico recente</p>
                <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Últimos cultos</h2>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/historico">
                  Ver histórico
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ultimos.map((e) => (
                <EventCard key={e.id} evento={e} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
