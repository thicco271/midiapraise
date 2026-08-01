import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { EventForm } from "@/components/praisehub/event-form";
import { UploadButton } from "@/components/praisehub/upload-button";
import { MediaGrid } from "@/components/praisehub/media-grid";
import type { MediaAssetDTO, MediaType } from "@/types";

export const metadata = { title: "Editar evento · ADSA Reimberg Mídias Admin" };

async function getDados(id: string) {
  const [evento, categorias, assets] = await Promise.all([
    db.event.findUnique({
      where: { id },
      include: { categoria: true, criadoPor: true, atualizadoPor: true },
    }),
    db.eventCategory.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    }),
    db.mediaAsset.findMany({
      where: { eventoId: id },
      include: { versoes: { orderBy: { numeroDaVersao: "desc" } } },
      orderBy: [{ tipo: "asc" }, { criadoEm: "desc" }],
    }),
  ]);
  return { evento, categorias, assets };
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

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { evento, categorias, assets } = await getDados(id);
  if (!evento) notFound();

  const categoriasDTO = categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    icone: c.icone,
    ativo: c.ativo,
    ordem: c.ordem,
  }));

  const eventoDTO = {
    id: evento.id,
    nome: evento.nome,
    slug: evento.slug,
    categoriaId: evento.categoriaId ?? "",
    descricao: evento.descricao ?? "",
    data: evento.data.toISOString(),
    horarioInicio: evento.horarioInicio,
    horarioFim: evento.horarioFim ?? "",
    local: evento.local ?? "",
    endereco: evento.endereco ?? "",
    tema: evento.tema ?? "",
    versiculo: evento.versiculo ?? "",
    pregador: evento.pregador ?? "",
    ministerio: evento.ministerio ?? "",
    capa: evento.capa ?? "",
    status: evento.status,
    visibilidade: evento.visibilidade,
    destaqueManual: evento.destaqueManual,
    observacoesInternas: evento.observacoesInternas ?? "",
  };

  const assetsPorTipo = (tipo: MediaType) =>
    assets.filter((a) => a.tipo === tipo).map(mapAsset);

  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6">
          <p className="praise-eyebrow">Administração</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Editar evento</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Editando <strong>{evento.nome}</strong>
          </p>
        </header>

        <EventForm categorias={categoriasDTO} eventoExistente={eventoDTO} />

        {/* Seção de Upload (Fase 3) */}
        <section className="mt-8 space-y-6">
          <div>
            <p className="praise-eyebrow">Central de artes</p>
            <h2 className="text-2xl font-bold text-foreground">Materiais do evento</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Envie artes oficiais (WhatsApp, redes sociais, banner/telão). Cada envio cria uma nova versão; a primeira versão vira oficial automaticamente.
            </p>
          </div>

          {TIPOS.map(({ tipo, label }) => (
            <div key={tipo} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </h3>
              <UploadButton
                eventoId={evento.id}
                eventoSlug={evento.slug}
                tipo={tipo}
                titulo={`Enviar ${label}`}
              />
              <MediaGrid assets={assetsPorTipo(tipo)} mostrarAcoesAdmin />
            </div>
          ))}
        </section>
      </div>
    </AdminGuard>
  );
}
