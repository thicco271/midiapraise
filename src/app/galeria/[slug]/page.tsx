import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatarData } from "@/lib/praise";
import { ChevronLeft, Images, Calendar, Camera, Download } from "lucide-react";
import { AlbumViewer } from "@/components/praisehub/album-viewer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await db.album.findUnique({ where: { slug } });
  if (!album) return { title: "Álbum não encontrado · ADSA Reimberg Mídias" };
  return {
    title: `${album.nome} · Galeria · ADSA Reimberg Mídias`,
    description: album.descricao ?? `Álbum de fotos: ${album.nome}`,
  };
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await db.album.findUnique({
    where: { slug },
    include: {
      fotos: { orderBy: { ordem: "asc" } },
      evento: { select: { nome: true, slug: true } },
    },
  });

  if (!album || album.status !== "publicado" || album.visibilidade !== "publico") {
    notFound();
  }

  const fotos = album.fotos.filter((f) => f.status === "publicado");

  return (
    <article className="praise-container py-6 sm:py-10">
      <nav aria-label="Trilha de navegação" className="mb-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/galeria">
            <ChevronLeft className="h-4 w-4" />
            Voltar para galeria
          </Link>
        </Button>
      </nav>

      <header className="mb-6 space-y-3">
        <p className="praise-eyebrow">Galeria · Álbum de fotos</p>
        <h1 className="praise-title">{album.nome}</h1>
        {album.descricao && (
          <p className="text-base text-muted-foreground">{album.descricao}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {album.evento && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-praise-gold" aria-hidden="true" />
              <Link href={`/eventos/${album.evento.slug}`} className="hover:text-foreground hover:underline">
                {album.evento.nome}
              </Link>
            </span>
          )}
          {album.fotografo && (
            <span className="flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-praise-gold" aria-hidden="true" />
              {album.fotografo}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Images className="h-4 w-4 text-praise-gold" aria-hidden="true" />
            {fotos.length} foto{fotos.length === 1 ? "" : "s"}
          </span>
          <span>{formatarData(album.publicadoEm ?? album.criadoEm)}</span>
        </div>
      </header>

      {fotos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
            <Images className="h-10 w-10 opacity-40" aria-hidden="true" />
            Este álbum ainda não tem fotos publicadas.
          </CardContent>
        </Card>
      ) : (
        <AlbumViewer
          fotos={fotos.map((f) => ({
            id: f.id,
            caminhoOriginal: f.caminhoOriginal,
            caminhoOtimizado: f.caminhoOtimizado,
            caminhoThumbnail: f.caminhoThumbnail,
            nomeOriginal: f.nomeOriginal,
            legenda: f.legenda,
            ordem: f.ordem,
            permitirDownload: album.permitirDownload,
          }))}
        />
      )}
    </article>
  );
}
