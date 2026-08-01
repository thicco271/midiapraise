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
  CalendarHeart,
  Monitor,
} from "lucide-react";
import { CopyLinkButton } from "@/components/praisehub/copy-link-button";
import { ShareWhatsAppButton } from "@/components/praisehub/share-whatsapp-button";
import { MediaGrid } from "@/components/praisehub/media-grid";
import { getCurrentUser, canManageEvents } from "@/lib/session";
import type { MediaAssetDTO, MediaType } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await db.event.findUnique({ where: { slug } });
  if (!evento) return { title: "Evento não encontrado · ADSA Reimberg Mídias" };
  return {
    title: `${evento.nome} · ADSA Reimberg Mídias`,
    description: evento.tema ?? evento.descricao ?? `Detalhes do evento ${evento.nome}`,
  };
}

function mapAsset(a: any): MediaAssetDTO {
  const versaoOficial = a.versoes?.find((v: any) => v.arquivoOficial) ?? a.versoes?.[0] ?? null;
  return {
    id: a.id,
    eventoId: a.eventoId,
    nome: a.nome,
    tipo: a.tipo,
    status: a.status,
    visibilidade: a.visibilidade,
    versaoAtual: a.versaoAtual,
    textoDeDivulgacao: a.textoDeDivulgacao,
    observacoes: a.observacoes,
    quantidadeDownloads: a.quantidadeDownloads,
    criadoEm: a.criadoEm instanceof Date ? a.criadoEm.toISOString() : a.criadoEm,
    atualizadoEm: a.atualizadoEm instanceof Date ? a.atualizadoEm.toISOString() : a.atualizadoEm,
    versaoOficial: versaoOficial
      ? {
          id: versaoOficial.id,
          numeroDaVersao: versaoOficial.numeroDaVersao,
          caminhoDoArquivo: versaoOficial.caminhoDoArquivo,
          caminhoThumbnail: versaoOficial.caminhoThumbnail,
          nomeOriginal: versaoOficial.nomeOriginal,
          nomePadronizado: versaoOficial.nomePadronizado,
          extensao: versaoOficial.extensao,
          mimeType: versaoOficial.mimeType,
          tamanho: versaoOficial.tamanho,
          largura: versaoOficial.largura,
          altura: versaoOficial.altura,
          arquivoOficial: versaoOficial.arquivoOficial,
          enviadoEm: versaoOficial.enviadoEm instanceof Date ? versaoOficial.enviadoEm.toISOString() : versaoOficial.enviadoEm,
        }
      : null,
    versoes: (a.versoes ?? []).map((v: any) => ({
      id: v.id,
      numeroDaVersao: v.numeroDaVersao,
      caminhoDoArquivo: v.caminhoDoArquivo,
      caminhoThumbnail: v.caminhoThumbnail,
      nomeOriginal: v.nomeOriginal,
      nomePadronizado: v.nomePadronizado,
      extensao: v.extensao,
      mimeType: v.mimeType,
      tamanho: v.tamanho,
      largura: v.largura,
      altura: v.altura,
      arquivoOficial: v.arquivoOficial,
      enviadoEm: v.enviadoEm instanceof Date ? v.enviadoEm.toISOString() : v.enviadoEm,
    })),
  };
}

const TIPOS: { tipo: MediaType; label: string }[] = [
  { tipo: "whatsapp", label: "WhatsApp e Stories" },
  { tipo: "rede_social", label: "Redes sociais" },
  { tipo: "banner_telao", label: "Banner / Telão" },
  { tipo: "outros", label: "Outros arquivos" },
];

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

  // Busca mídias
  const user = await getCurrentUser();
  const isAdmin = !!user && canManageEvents(user.perfil);

  const whereMedia: any = { eventoId: evento.id };
  if (!isAdmin) {
    whereMedia.AND = [{ status: "publicado" }, { visibilidade: "publico" }];
  }

  const assets = await db.mediaAsset.findMany({
    where: whereMedia,
    include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
    orderBy: [{ tipo: "asc" }, { criadoEm: "desc" }],
  });

  const assetsPorTipo = (tipo: MediaType) =>
    assets.filter((a) => a.tipo === tipo).map(mapAsset);

  const totalArquivos = assets.length;

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

          {/* Ações rápidas */}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="praise-touch">
              <a
                href={`/telao?evento=${evento.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Monitor className="h-4 w-4" />
                Modo Telão
              </a>
            </Button>
          </div>

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

          {/* Central de materiais — real */}
          <section aria-label="Central de materiais" className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-foreground">Materiais oficiais</h2>
                <p className="text-xs text-muted-foreground">
                  {totalArquivos > 0
                    ? `${totalArquivos} arquivo${totalArquivos === 1 ? "" : "s"} disponíve${totalArquivos === 1 ? "l" : "is"}`
                    : "Ainda não há materiais publicados para este evento."}
                </p>
              </div>
              {isAdmin && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/eventos/${evento.id}`}>
                    <Download className="h-4 w-4" />
                    Gerenciar arquivos
                  </Link>
                </Button>
              )}
            </div>

            {TIPOS.map(({ tipo, label }) => {
              const lista = assetsPorTipo(tipo);
              return (
                <div key={tipo} className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </h3>
                  <MediaGrid assets={lista} />
                </div>
              );
            })}
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
