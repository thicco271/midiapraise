"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  File as FileIcon,
  ImageIcon,
  Clock,
  Loader2,
  History,
  Eye,
  EyeOff,
  Archive,
} from "lucide-react";
import { formatarData } from "@/lib/praise";
import { toast } from "sonner";
import type { MediaAssetDTO } from "@/types";

interface MediaGridProps {
  assets: MediaAssetDTO[];
  titulo?: string;
  mostrarAcoesAdmin?: boolean;
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const STATUS_INFO: Record<string, { label: string; className: string }> = {
  rascunho: { label: "Rascunho", className: "bg-slate-200 text-slate-700" },
  em_aprovacao: { label: "Em aprovação", className: "bg-amber-100 text-amber-700" },
  aprovado: { label: "Aprovado", className: "bg-emerald-100 text-emerald-700" },
  publicado: { label: "Publicado", className: "bg-emerald-600 text-white" },
  arquivado: { label: "Arquivado", className: "bg-slate-100 text-slate-500" },
};

export function MediaGrid({ assets, titulo, mostrarAcoesAdmin = false }: MediaGridProps) {
  const router = useRouter();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  if (assets.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
          <ImageIcon className="h-8 w-8 opacity-40" aria-hidden="true" />
          Nenhum material enviado ainda.
        </CardContent>
      </Card>
    );
  }

  const handleDownload = async (asset: MediaAssetDTO) => {
    const versao = asset.versaoOficial;
    if (!versao) {
      toast.error("Sem versão oficial disponível");
      return;
    }
    setDownloadingId(asset.id);
    try {
      const a = document.createElement("a");
      a.href = `/api/media/${versao.id}/download`;
      a.download = versao.nomePadronizado;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Download iniciado: ${versao.nomePadronizado}`);
    } catch {
      toast.error("Falha ao iniciar download");
    } finally {
      setTimeout(() => setDownloadingId(null), 1500);
    }
  };

  const alterarStatus = async (asset: MediaAssetDTO, novoStatus: "publicado" | "rascunho" | "arquivado") => {
    setActionLoadingId(asset.id);
    try {
      const res = await fetch(`/api/media/${asset.id}/publicar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao alterar status");
        return;
      }
      toast.success(`Status alterado para: ${STATUS_INFO[novoStatus]?.label ?? novoStatus}`);
      router.refresh();
    } catch {
      toast.error("Falha na comunicação com o servidor");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Card>
      {titulo && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>{titulo}</span>
            <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
              {assets.length} {assets.length === 1 ? "arquivo" : "arquivos"}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => {
          const versao = asset.versaoOficial;
          const isImage = versao?.mimeType?.startsWith("image/");
          const statusInfo = STATUS_INFO[asset.status] ?? STATUS_INFO.rascunho;
          return (
            <div
              key={asset.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
            >
              {/* Preview */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {versao?.caminhoThumbnail ? (
                  <img
                    src={versao.caminhoThumbnail}
                    alt={`Pré-visualização de ${asset.nome}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : isImage && versao ? (
                  <img
                    src={versao.caminhoDoArquivo}
                    alt={`Pré-visualização de ${asset.nome}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
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
                  {asset.versoes.length > 1 && (
                    <Badge variant="outline" className="border-0 bg-black/60 text-white backdrop-blur">
                      <History className="mr-1 h-3 w-3" aria-hidden="true" />
                      {asset.versoes.length}
                    </Badge>
                  )}
                </div>
                <div className="absolute left-2 top-2">
                  <Badge variant="outline" className={`border-0 ${statusInfo.className}`}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{asset.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {versao?.extensao.toUpperCase()} · {versao ? formatarTamanho(versao.tamanho) : "—"}
                    {versao?.largura && versao?.altura && ` · ${versao.largura}×${versao.altura}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <span>{formatarData(asset.atualizadoEm)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{asset.quantidadeDownloads} download{asset.quantidadeDownloads === 1 ? "" : "s"}</span>
                </div>

                {/* Ações */}
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(asset)}
                    disabled={!versao || downloadingId === asset.id}
                    className="flex-1 praise-touch"
                  >
                    {downloadingId === asset.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Baixar
                  </Button>

                  {mostrarAcoesAdmin && asset.status !== "publicado" && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => alterarStatus(asset, "publicado")}
                      disabled={actionLoadingId === asset.id}
                      aria-label="Publicar"
                      className="praise-touch"
                    >
                      {actionLoadingId === asset.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      Publicar
                    </Button>
                  )}

                  {mostrarAcoesAdmin && asset.status === "publicado" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alterarStatus(asset, "rascunho")}
                      disabled={actionLoadingId === asset.id}
                      aria-label="Despublicar"
                      className="praise-touch"
                    >
                      {actionLoadingId === asset.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                      Despublicar
                    </Button>
                  )}

                  {mostrarAcoesAdmin && asset.status !== "arquivado" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => alterarStatus(asset, "arquivado")}
                      disabled={actionLoadingId === asset.id}
                      aria-label="Arquivar"
                      className="praise-touch"
                    >
                      {actionLoadingId === asset.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
