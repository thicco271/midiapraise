// Página de diagnóstico de mídias — verifica se arquivos físicos existem
import { db } from "@/lib/db";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

export default async function DebugMidiasPage() {
  const medias = await db.mediaAsset.findMany({
    include: {
      versoes: { orderBy: { numeroDaVersao: "desc" } },
      evento: { select: { nome: true, slug: true } },
    },
    orderBy: [{ evento: { data: "asc" } }, { tipo: "asc" }],
  });

  const publicDir = path.join(process.cwd(), "public");

  // Verificar cada arquivo
  const verificacoes = medias.map((m) => {
    const versao = m.versoes[0];
    if (!versao) return { media: m, versao: null, existeArquivo: false, existeThumb: false };

    const caminhoArquivo = versao.caminhoDoArquivo.startsWith("/")
      ? versao.caminhoDoArquivo.slice(1)
      : versao.caminhoDoArquivo;
    const absArquivo = path.join(publicDir, caminhoArquivo);

    const caminhoThumb = versao.caminhoThumbnail?.startsWith("/")
      ? versao.caminhoThumbnail.slice(1)
      : versao.caminhoThumbnail;
    const absThumb = caminhoThumb ? path.join(publicDir, caminhoThumb) : null;

    return {
      media: m,
      versao,
      existeArquivo: fs.existsSync(absArquivo),
      tamanhoArquivo: fs.existsSync(absArquivo) ? fs.statSync(absArquivo).size : 0,
      existeThumb: absThumb ? fs.existsSync(absThumb) : null,
      caminhoAbs: absArquivo,
    };
  });

  return (
    <div className="praise-container py-8 font-mono text-sm">
      <h1 className="mb-4 text-2xl font-bold">Diagnóstico de Mídias</h1>

      <div className="mb-6 rounded-md border border-border bg-muted/30 p-4">
        <h2 className="mb-2 font-bold">Resumo</h2>
        <p>Total de mídias no banco: <strong>{medias.length}</strong></p>
        <p>Mídias com arquivo físico: <strong>{verificacoes.filter(v => v.existeArquivo).length}</strong></p>
        <p>Mídias sem arquivo físico: <strong>{verificacoes.filter(v => v.versao && !v.existeArquivo).length}</strong></p>
      </div>

      {medias.length === 0 ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p className="font-bold">⚠️ Nenhuma mídia no banco!</p>
          <p className="mt-2 text-sm">
            Para criar mídias, acesse <code className="bg-amber-100 px-1">/admin/eventos/[id]</code> e faça upload de artes.
          </p>
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-2">Evento</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Status</th>
              <th className="p-2">Arquivo</th>
              <th className="p-2">Existe?</th>
              <th className="p-2">Tamanho</th>
              <th className="p-2">Thumb</th>
              <th className="p-2">Preview</th>
            </tr>
          </thead>
          <tbody>
            {verificacoes.map((v) => (
              <tr key={v.media.id} className="border-b border-border">
                <td className="p-2 font-semibold">{v.media.evento.nome}</td>
                <td className="p-2">{v.media.tipo}</td>
                <td className="p-2">
                  <span className={v.media.status === "publicado" ? "text-emerald-600" : "text-amber-600"}>
                    {v.media.status}
                  </span>
                </td>
                <td className="p-2 text-muted-foreground text-[10px]">
                  {v.versao?.caminhoDoArquivo}
                </td>
                <td className="p-2">
                  {v.existeArquivo ? (
                    <span className="text-emerald-600">✓</span>
                  ) : (
                    <span className="text-red-600">✗</span>
                  )}
                </td>
                <td className="p-2">
                  {v.tamanhoArquivo > 0 ? `${(v.tamanhoArquivo / 1024).toFixed(0)} KB` : "—"}
                </td>
                <td className="p-2">
                  {v.existeThumb === null ? "—" : v.existeThumb ? "✓" : "✗"}
                </td>
                <td className="p-2">
                  {v.existeArquivo ? (
                    <img
                      src={v.versao?.caminhoThumbnail ?? v.versao?.caminhoDoArquivo}
                      alt="Preview"
                      className="h-12 w-16 rounded object-cover"
                    />
                  ) : (
                    <span className="text-red-600 text-[10px]">SEM ARQUIVO</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
        <h2 className="mb-2 font-bold">Como interpretar</h2>
        <ul className="space-y-1 text-xs">
          <li>• Se <strong>Existe = ✗</strong>: o arquivo foi deletado do disco mas o registro existe no banco</li>
          <li>• Se <strong>Status ≠ publicado</strong>: a mídia não aparece publicamente (vá em /admin/eventos para publicar)</li>
          <li>• Se <strong>Preview</strong> mostra imagem: está tudo OK</li>
          <li>• Se <strong>Preview</strong> mostra "SEM ARQUIVO": precisa re-fazer upload</li>
        </ul>
      </div>
    </div>
  );
}
