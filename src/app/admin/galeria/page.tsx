export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { db } from "@/lib/db";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatarData } from "@/lib/praise";
import { Plus, Images, ChevronRight } from "lucide-react";

export const metadata = { title: "Galeria · ADSA Reimberg Mídias Admin" };

async function getAlbuns() {
  return db.album.findMany({
    include: {
      fotos: { select: { id: true, caminhoThumbnail: true, caminhoOriginal: true } },
      evento: { select: { nome: true } },
      _count: { select: { fotos: true } },
    },
    orderBy: [{ criadoEm: "desc" }],
  });
}

const STATUS_INFO: Record<string, { label: string; className: string }> = {
  rascunho: { label: "Rascunho", className: "bg-slate-200 text-slate-700" },
  publicado: { label: "Publicado", className: "bg-emerald-600 text-white" },
  arquivado: { label: "Arquivado", className: "bg-slate-100 text-slate-500" },
};

export default async function AdminGaleriaPage() {
  const albuns = await getAlbuns();

  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="praise-eyebrow">Administração</p>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Galeria de fotos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {albuns.length} álbum{albuns.length === 1 ? "" : "ns"} no total
            </p>
          </div>
          <Button asChild className="praise-touch">
            <Link href="/admin/galeria/novo">
              <Plus className="h-4 w-4" />
              Novo álbum
            </Link>
          </Button>
        </header>

        {albuns.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <Images className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <p className="text-lg font-semibold">Nenhum álbum ainda</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Crie o primeiro álbum de fotos da ADSA Reimberg.
              </p>
              <Button asChild>
                <Link href="/admin/galeria/novo">
                  <Plus className="h-4 w-4" />
                  Criar primeiro álbum
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {albuns.map((album) => {
                  const fotoCapa = album.capaPhotoId
                    ? album.fotos.find((f) => f.id === album.capaPhotoId)
                    : album.fotos[0];
                  const statusInfo = STATUS_INFO[album.status] ?? STATUS_INFO.rascunho;
                  return (
                    <li key={album.id}>
                      <Link
                        href={`/admin/galeria/${album.id}`}
                        className="flex flex-col gap-3 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4"
                      >
                        {/* Capa */}
                        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                          {fotoCapa?.caminhoThumbnail ? (
                            <img
                              src={fotoCapa.caminhoThumbnail}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : fotoCapa?.caminhoOriginal ? (
                            <img
                              src={fotoCapa.caminhoOriginal}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Images className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-foreground">{album.nome}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {album.evento?.nome ?? "Sem evento vinculado"}
                            {album.fotografo && ` · ${album.fotografo}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {album._count.fotos} foto{album._count.fotos === 1 ? "" : "s"} · {formatarData(album.criadoEm)}
                          </p>
                        </div>

                        {/* Status + ação */}
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`border-0 ${statusInfo.className}`}>
                            {statusInfo.label}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminGuard>
  );
}
