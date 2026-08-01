import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  formatarData,
  formatarDataLonga,
  diaDaSemana,
  formatarHorario,
} from "@/lib/praise";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronLeft,
  Download,
  Image as ImageIcon,
  Share2,
  Info,
  CalendarHeart,
} from "lucide-react";
import { CopyLinkButton } from "@/components/praisehub/copy-link-button";
import { ShareWhatsAppButton } from "@/components/praisehub/share-whatsapp-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await db.event.findUnique({ where: { slug } });
  if (!evento) return { title: "Evento não encontrado · ADSA Reimberg Mídias" };
  return {
    title: `${evento.nome} · ADSA Reimberg Mídias`,
    description: evento.tema ?? evento.descricao ?? `Detalhes do evento ${evento.nome}`,
  };
}

export default async function EventoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const evento = await db.event.findUnique({
    where: { slug },
    include: { categoria: true, criadoPor: true },
  });

  if (!evento || (evento.status !== "publicado" && evento.visibilidade !== "publico")) {
    notFound();
  }

  return (
    <article className="praise-container py-6 sm:py-10">
      <nav aria-label="Trilha de navegação" className="mb-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/eventos">
            <ChevronLeft className="h-4 w-4" />
            Voltar para eventos
          </Link>
        </Button>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Coluna principal */}
        <div className="space-y-6">
          <header className="space-y-3">
            <p className="praise-eyebrow">
              {evento.categoria?.nome ?? "Evento"} · Material oficial
            </p>
            <h1 className="praise-title">{evento.nome}</h1>
            {evento.tema && (
              <p className="text-lg italic text-muted-foreground">&ldquo;{evento.tema}&rdquo;</p>
            )}
            {evento.versiculo && (
              <p className="inline-flex items-center gap-2 rounded-md bg-secondary/60 px-3 py-1.5 text-sm text-foreground">
                <BookOpen className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                {evento.versiculo}
              </p>
            )}
          </header>

          {evento.capa && (
            <div className="overflow-hidden rounded-xl border border-border shadow-sm">
              { }
              <img
                src={evento.capa}
                alt={`Capa oficial do evento ${evento.nome}`}
                className="aspect-video w-full object-cover"
              />
            </div>
          )}

          {evento.descricao && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre o evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {evento.descricao}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Central de materiais (placeholder estruturado) */}
          <section aria-label="Central de materiais" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Materiais</h2>
              <span className="text-xs text-muted-foreground">
                Pacotes completos em breve (Fase 3)
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { nome: "WhatsApp e Stories", status: "pendente" },
                { nome: "Redes sociais", status: "pendente" },
                { nome: "Banner / Telão", status: "pendente" },
              ].map((m) => (
                <Card key={m.nome} className="praise-card">
                  <CardContent className="flex items-start gap-3 p-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <ImageIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{m.nome}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
                        <Info className="h-3 w-3" aria-hidden="true" />
                        {m.status === "pendente" ? "Pendente" : "Disponível"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Os uploads de artes, versionamento, aprovação e download em ZIP serão entregues na <strong>Fase 3</strong> da especificação. Já é possível visualizar e compartilhar o evento.
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quando & onde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-praise-gold" aria-hidden="true" />
                <div>
                  <p className="capitalize">{diaDaSemana(evento.data)}</p>
                  <p className="text-muted-foreground">{formatarDataLonga(evento.data)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-praise-gold" aria-hidden="true" />
                <div>
                  <p>Início: {formatarHorario(evento.horarioInicio)}</p>
                  {evento.horarioFim && <p className="text-muted-foreground">Término: {formatarHorario(evento.horarioFim)}</p>}
                </div>
              </div>
              {evento.local && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-praise-gold" aria-hidden="true" />
                  <div>
                    <p>{evento.local}</p>
                    {evento.endereco && <p className="text-muted-foreground">{evento.endereco}</p>}
                  </div>
                </div>
              )}
              {evento.pregador && (
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-praise-gold" aria-hidden="true" />
                  <p>{evento.pregador}</p>
                </div>
              )}
              {evento.ministerio && (
                <div className="border-t border-border pt-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Ministério</p>
                  <p className="text-sm">{evento.ministerio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compartilhar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <CopyLinkButton url={`/eventos/${evento.slug}`} className="w-full justify-start praise-touch" />
              <ShareWhatsAppButton slug={evento.slug} nome={evento.nome} className="w-full justify-start praise-touch" />
              <Button variant="outline" className="w-full justify-start praise-touch" disabled>
                <Download className="h-4 w-4" />
                Baixar todas as artes (Fase 3)
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary/40">
            <CardContent className="flex items-start gap-2 p-4 text-xs text-muted-foreground">
              <CalendarHeart className="mt-0.5 h-4 w-4 shrink-0 text-praise-gold" aria-hidden="true" />
              <p>
                Este evento foi publicado oficialmente pela equipe de mídia em{" "}
                {evento.publicadoEm ? formatarData(evento.publicadoEm) : "—"}.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </article>
  );
}
