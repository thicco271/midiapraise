import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { AlbumForm } from "@/components/praisehub/album-form";
import { AlbumPhotoManager } from "@/components/praisehub/album-photo-manager";

export const metadata = { title: "Editar álbum · ADSA Reimberg Mídias Admin" };

async function getDados(id: string) {
  const [album, eventos] = await Promise.all([
    db.album.findUnique({
      where: { id },
      include: { fotos: { orderBy: { ordem: "asc" } } },
    }),
    db.event.findMany({
      where: { status: { not: "arquivado" } },
      orderBy: { data: "asc" },
      select: { id: true, nome: true, data: true },
    }),
  ]);
  return { album, eventos };
}

export default async function EditarAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { album, eventos } = await getDados(id);
  if (!album) notFound();

  const albumDTO = {
    id: album.id,
    nome: album.nome,
    eventoId: album.eventoId ?? "",
    descricao: album.descricao ?? "",
    fotografo: album.fotografo ?? "",
    visibilidade: album.visibilidade,
    permitirDownload: album.permitirDownload,
    aceitarContribuicoes: album.aceitarContribuicoes,
    status: album.status,
  };

  const fotosDTO = album.fotos.map((f) => ({
    id: f.id,
    caminhoOriginal: f.caminhoOriginal,
    caminhoOtimizado: f.caminhoOtimizado,
    caminhoThumbnail: f.caminhoThumbnail,
    nomeOriginal: f.nomeOriginal,
    legenda: f.legenda,
    ordem: f.ordem,
    status: f.status,
    enviadoEm: f.enviadoEm.toISOString(),
  }));

  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6">
          <p className="praise-eyebrow">Administração</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Editar álbum</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Editando <strong>{album.nome}</strong>
          </p>
        </header>

        <div className="space-y-6">
          <AlbumForm eventos={eventos.map((e) => ({ id: e.id, nome: e.nome, data: e.data.toISOString() }))} albumExistente={albumDTO} />

          {/* Gerenciador de fotos */}
          <AlbumPhotoManager
            albumId={album.id}
            fotosIniciais={fotosDTO}
            capaPhotoId={album.capaPhotoId}
          />
        </div>
      </div>
    </AdminGuard>
  );
}
