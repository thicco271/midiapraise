export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatarData } from "@/lib/praise";
import { Images, ChevronRight, Calendar } from "lucide-react";

export const metadata = {
  title: "Galeria de fotos · ADSA Reimberg Mídias",
  description: "Álbuns de fotos dos cultos e eventos da ADSA Reimberg.",
};

async function getAlbuns() {
  return db.album.findMany({
    where: { status: "publicado", visibilidade: "publico" },
    include: {
      fotos: {
        select: { id: true, caminhoThumbnail: true, caminhoOriginal: true },
      },
      evento: { select: { nome: true, slug: true } },
    },
    orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
  });
}

export default async function GaleriaPage() {
  const albuns = await getAlbuns();

  return (
    <div className="praise-container py-8 sm:py-12">
      <header className="mb-8 space-y-2">
        <p className="praise-eyebrow">Galeria</p>
        <h1 className="praise-title">Álbuns de fotos</h1>
        <p className="praise-subtitle max-w-2xl">
          Registramos os momentos especiais dos cultos e eventos da ADSA Reimberg. Selecione um álbum para ver as fotos.
        </p>
      </header>

      {albuns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Images className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-semibold">Nenhum álbum publicado</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Ainda não há álbuns públicos disponíveis. Volte em breve.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Voltar para o início</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albuns.map((album) => {
            const fotoCapa = album.capaPhotoId
              ? album.fotos.find((f) => f.id === album.capaPhotoId)
              : album.fotos[0];
            return (
              <Link
                key={album.id}
                href={`/galeria/${album.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Capa */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {fotoCapa?.caminhoThumbnail ? (
                    <img
                      src={fotoCapa.caminhoThumbnail}
                      alt={`Capa do álbum ${album.nome}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : fotoCapa?.caminhoOriginal ? (
                    <img
                      src={fotoCapa.caminhoOriginal}
                      alt={`Capa do álbum ${album.nome}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-praise-gold/10">
                      <Images className="h-12 w-12 text-primary/40" aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <Badge variant="outline" className="border-0 bg-black/60 text-white backdrop-blur">
                      {album.fotos.length} foto{album.fotos.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="text-base font-bold text-foreground line-clamp-1">{album.nome}</h3>
                  {album.evento && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {album.evento.nome}
                    </p>
                  )}
                  {album.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{album.descricao}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatarData(album.publicadoEm ?? album.criadoEm)}</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
