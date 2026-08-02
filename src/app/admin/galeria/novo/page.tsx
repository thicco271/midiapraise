export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/lib/db";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { AlbumForm } from "@/components/praisehub/album-form";

export const metadata = { title: "Novo álbum · ADSA Reimberg Mídias Admin" };

async function getEventos() {
  return db.event.findMany({
    where: { status: { not: "arquivado" } },
    orderBy: { data: "asc" },
    select: { id: true, nome: true, data: true },
  });
}

export default async function NovoAlbumPage() {
  const eventos = await getEventos();
  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6">
          <p className="praise-eyebrow">Administração</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Novo álbum</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie o álbum. Você poderá adicionar fotos na próxima etapa.
          </p>
        </header>
        <AlbumForm
          eventos={eventos.map((e) => ({
            id: e.id,
            nome: e.nome,
            data: e.data.toISOString(),
          }))}
        />
      </div>
    </AdminGuard>
  );
}
