// Página de diagnóstico — mostra TODOS os eventos do banco
// Útil para depurar problemas em produção
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const [eventos, albuns, medias, cultos, settings] = await Promise.all([
    db.event.findMany({
      orderBy: { data: "asc" },
      select: {
        id: true, nome: true, slug: true, data: true, status: true,
        visibilidade: true, destaqueManual: true, criadoEm: true,
      },
    }),
    db.album.count(),
    db.mediaAsset.count(),
    db.serviceSchedule.count(),
    db.churchSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <div className="praise-container py-8 font-mono text-sm">
      <h1 className="mb-4 text-2xl font-bold">Diagnóstico do Banco</h1>

      <div className="mb-6 rounded-md border border-border bg-muted/30 p-4">
        <h2 className="mb-2 font-bold">Configurações da Igreja</h2>
        <pre className="text-xs">{JSON.stringify(settings, null, 2)}</pre>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Eventos</p>
          <p className="text-2xl font-bold">{eventos.length}</p>
        </div>
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Álbuns</p>
          <p className="text-2xl font-bold">{albuns}</p>
        </div>
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Mídias</p>
          <p className="text-2xl font-bold">{medias}</p>
        </div>
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Cultos (horários)</p>
          <p className="text-2xl font-bold">{cultos}</p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/30 p-4">
        <h2 className="mb-2 font-bold">Todos os Eventos ({eventos.length})</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Data atual do servidor: {new Date().toISOString()}
        </p>
        {eventos.length === 0 ? (
          <p className="text-red-600">⚠️ NENHUM evento no banco!</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-2">Data</th>
                <th className="p-2">Nome</th>
                <th className="p-2">Slug</th>
                <th className="p-2">Status</th>
                <th className="p-2">Visibilidade</th>
                <th className="p-2">Destaque</th>
                <th className="p-2">Link</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} className="border-b border-border">
                  <td className="p-2">{e.data.toISOString()}</td>
                  <td className="p-2 font-semibold">{e.nome}</td>
                  <td className="p-2 text-muted-foreground">{e.slug}</td>
                  <td className="p-2">
                    <span className={e.status === "publicado" ? "text-emerald-600" : "text-amber-600"}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-2">{e.visibilidade}</td>
                  <td className="p-2">{e.destaqueManual ? "⭐" : "—"}</td>
                  <td className="p-2">
                    <a
                      href={`/eventos/${e.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      /eventos/{e.slug}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
        <h2 className="mb-2 font-bold">Como interpretar</h2>
        <ul className="space-y-1 text-xs">
          <li>• Se <strong>Eventos = 0</strong>: o banco está vazio. Rode o seed: <code className="bg-amber-100 px-1">bun run scripts/seed.ts</code></li>
          <li>• Se <strong>status ≠ publicado</strong>: o evento não aparece na página pública</li>
          <li>• Se <strong>visibilidade ≠ publico</strong>: o evento não aparece para visitantes</li>
          <li>• Clique no link para testar se a página do evento abre</li>
          <li>• Se o link der 404, o evento pode estar com slug errado ou status não-publicado</li>
        </ul>
      </div>

      <div className="mt-6">
        <a
          href="/admin/eventos"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Ir para admin de eventos
        </a>
      </div>
    </div>
  );
}
