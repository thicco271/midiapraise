import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  formatarData,
  formatarDataLonga,
  diaDaSemana,
  formatarHorario,
} from "@/lib/praise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronLeft,
  Download,
  File as FileIcon,
  ImageIcon,
  CalendarHeart,
  Monitor,
  Share2,
} from "lucide-react";
import { CopyLinkButton } from "@/components/praisehub/copy-link-button";
import { ShareWhatsAppButton } from "@/components/praisehub/share-whatsapp-button";
import type { MediaAssetDTO, MediaType } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await db.event.findUnique({ where: { slug } });
  if (!evento) return { title: "Culto não encontrado · ADSA Reimberg Mídias" };
  return {
    title: `Baixar artes · ${evento.nome} · ADSA Reimberg Mídias`,
    description: `Materiais oficiais de ${evento.nome} para download direto — sem login.`,
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
    versoes: [],
  };
}

const TIPOS: { tipo: MediaType; label: string; descricao: string }[] = [
  { tipo: "whatsapp", label: "WhatsApp e Stories", descricao: "Formato vertical 1080×1920" },
  { tipo: "rede_social", label: "Redes sociais", descricao: "Quadrado/vertical para Instagram, Facebook" },
  { tipo: "banner_telao", label: "Banner / Telão", descricao: "Proporção 16:9 para projeção" },
  { tipo: "outros", label: "Outros arquivos", descricao: "PDFs, vídeos, ZIPs, etc." },
];

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function BaixarEventoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const evento = await db.event.findUnique({
    where: { slug },
    include: { categoria: true },
  });

  if (!evento || evento.status !== "publicado" || evento.visibilidade !== "publico") {
    notFound();
  }

  // Busca apenas mídias publicadas + públicas
  const assets = await db.mediaAsset.findMany({
    where: {
      eventoId: evento.id,
      status: "publicado",
      visibilidade: "publico",
    },
    include: {
      versoes: {
        where: { arquivoOficial: true },
        take: 1,
      },
    },
    orderBy: [{ tipo: "asc" }, { criadoEm: "desc" }],
  });

  const assetsPorTipo = (tipo: MediaType) =>
    assets.filter((a) => a.tipo === tipo).map(mapAsset);

  const totalArquivos = assets.length;
  const totalDownloads = assets.reduce((acc, a) => acc + (a.quantidadeDownloads ?? 0), 0);

  return (
    <article className="praise-container py-6 sm:py-10">
      <nav aria-label="Trilha de navegação" className="mb-4 flex items-center gap-2 text-sm">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/baixar">
            <ChevronLeft className="h-4 w-4" />
            Voltar para lista
          </Link>
        </Button>
      </nav>

      <header className="mb-6 space-y-3">
        <p className="praise-eyebrow">
          {evento.categoria?.nome ?? "Evento"} · Download de materiais
        </p>
        <h1 className="praise-title">{evento.nome}</h1>
        {evento.tema && (
          <p className="text-lg italic text-muted-foreground">&ldquo;{evento.tema}&rdquo;</p>
        )}

        {/* Info rápida do culto */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-praise-gold" aria-hidden="true" />
            <span className="capitalize">{diaDaSemana(evento.data)}</span>
            <span aria-hidden="true">·</span>
            <span>{formatarData(evento.data)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-praise-gold" aria-hidden="true" />
            {formatarHorario(evento.horarioInicio)}
          </span>
          {evento.local && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-praise-gold" aria-hidden="true" />
              {evento.local}
            </span>
          )}
          {evento.pregador && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-praise-gold" aria-hidden="true" />
              {evento.pregador}
            </span>
          )}
        </div>

        {/* Resumo */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {totalArquivos > 0 ? (
            <Badge variant="outline" className="border-0 bg-emerald-100 text-emerald-700">
              <Download className="mr-1 h-3 w-3" aria-hidden="true" />
              {totalArquivos} arquivo{totalArquivos === 1 ? "" : "s"} disponíve{totalArquivos === 1 ? "l" : "is"}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-0 bg-amber-100 text-amber-700">
              Sem arquivos publicados
            </Badge>
          )}
          {totalDownloads > 0 && (
            <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
              {totalDownloads} download{totalDownloads === 1 ? "" : "s"} no total
            </Badge>
          )}
        </div>

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-2 pt-3">
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
      </header>

      {/* Grid de materiais por tipo */}
      {totalArquivos === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-semibold">Ainda não há artes publicadas</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Os materiais deste culto ainda não foram publicados pela equipe de mídia.
              Volte em breve ou confira outros cultos.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/baixar">Ver outros cultos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {TIPOS.map(({ tipo, label, descricao }) => {
            const lista = assetsPorTipo(tipo);
            if (lista.length === 0) return null;
            return (
              <section key={tipo} aria-labelledby={`titulo-${tipo}`}>
                <div className="mb-3">
                  <h2 id={`titulo-${tipo}`} className="text-lg font-bold text-foreground">
                    {label}
                  </h2>
                  <p className="text-xs text-muted-foreground">{descricao}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lista.map((asset) => {
                    const versao = asset.versaoOficial;
                    const isImage = versao?.mimeType?.startsWith("image/");
                    return (
                      <Card
                        key={asset.id}
                        className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
                      >
                        {/* Preview */}
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          {versao?.caminhoThumbnail ? (
                            <img
                              src={versao.caminhoThumbnail}
                              alt={`Pré-visualização de ${asset.nome}`}
                              className="h-full w-full object-cover"
                              loading="eager"
                            />
                          ) : isImage && versao ? (
                            <img
                              src={versao.caminhoDoArquivo}
                              alt={`Pré-visualização de ${asset.nome}`}
                              className="h-full w-full object-cover"
                              loading="eager"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-praise-gold/10">
                              <FileIcon className="h-10 w-10 text-primary/40" aria-hidden="true" />
                            </div>
                          )}
                          <div className="absolute right-2 top-2 flex gap-1">
                            {versao && (
                              <Badge variant="outline" className="border-0 bg-black/60 text-white backdrop-blur">
                                v{versao.numeroDaVersao}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <CardContent className="flex flex-1 flex-col gap-2 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {versao?.nomePadronizado ?? asset.nome}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {versao?.extensao.toUpperCase()} · {versao ? formatarTamanho(versao.tamanho) : "—"}
                              {versao?.largura && versao?.altura && ` · ${versao.largura}×${versao.altura}`}
                            </p>
                          </div>

                          {/* Botão de download direto */}
                          {versao && (
                            <Button
                              asChild
                              size="sm"
                              className="mt-auto praise-touch"
                            >
                              <a
                                href={`/api/media/${versao.id}/download`}
                                download={versao.nomePadronizado}
                                aria-label={`Baixar ${versao.nomePadronizado}`}
                              >
                                <Download className="h-4 w-4" />
                                Baixar arquivo
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Compartilhar */}
          <Card className="bg-secondary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Share2 className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                Compartilhar esta página
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <CopyLinkButton url={`/baixar/${evento.slug}`} className="praise-touch" />
              <ShareWhatsAppButton
                slug={evento.slug}
                nome={evento.nome}
                className="praise-touch"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Outros cultos */}
      <aside className="mt-10 border-t border-border pt-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarHeart className="h-4 w-4 text-praise-gold" aria-hidden="true" />
            Outros cultos
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/baixar">Ver todos</Link>
          </Button>
        </div>
      </aside>
    </article>
  );
}
