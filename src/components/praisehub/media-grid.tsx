"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Pencil,
  Trash2,
  Upload,
  X,
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

  // Modal de edição
  const [editando, setEditando] = useState<MediaAssetDTO | null>(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    observacoes: "",
    textoDeDivulgacao: "",
    visibilidade: "publico" as "publico" | "privado",
  });
  // Substituição de arquivo dentro do modal de edição
  const [substituirArquivo, setSubstituirArquivo] = useState<File | null>(null);
  const [substituirPreview, setSubstituirPreview] = useState<string | null>(null);
  const [substituindo, setSubstituindo] = useState(false);

  // Modal de exclusão
  const [excluindo, setExcluindo] = useState<MediaAssetDTO | null>(null);

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

  const abrirEdicao = (asset: MediaAssetDTO) => {
    setEditando(asset);
    setEditForm({
      nome: asset.nome,
      observacoes: asset.observacoes ?? "",
      textoDeDivulgacao: asset.textoDeDivulgacao ?? "",
      visibilidade: (asset.visibilidade as "publico" | "privado") ?? "publico",
    });
    setSubstituirArquivo(null);
    if (substituirPreview) URL.revokeObjectURL(substituirPreview);
    setSubstituirPreview(null);
  };

  const selecionarSubstituto = (file: File | null) => {
    if (substituirPreview) URL.revokeObjectURL(substituirPreview);
    setSubstituirArquivo(file);
    setSubstituirPreview(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  };

  const substituirArquivoAtual = async () => {
    if (!editando || !substituirArquivo) return;
    setSubstituindo(true);
    try {
      const formData = new FormData();
      formData.append("file", substituirArquivo);
      formData.append("tipo", editando.tipo);
      formData.append("nome", editando.nome);

      const res = await fetch(`/api/events/${editando.eventoId}/upload`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao substituir arquivo");
        return;
      }
      toast.success("Nova versão enviada! A versão atual foi substituída.");
      selecionarSubstituto(null);
      setEditando(null);
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    } finally {
      setSubstituindo(false);
    }
  };

  const salvarEdicao = async () => {
    if (!editando) return;
    if (!editForm.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setActionLoadingId(editando.id);
    try {
      const res = await fetch(`/api/media/${editando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao salvar");
        return;
      }
      toast.success("Mídia atualizada!");
      setEditando(null);
      router.refresh();
    } catch {
      toast.error("Falha na comunicação com o servidor");
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmarExclusao = async () => {
    if (!excluindo) return;
    setActionLoadingId(excluindo.id);
    try {
      const res = await fetch(`/api/media/${excluindo.id}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao excluir");
        return;
      }
      toast.success(`Mídia '${excluindo.nome}' excluída (${body.data?.apagados ?? 0} arquivo(s) apagado(s))`);
      setExcluindo(null);
      router.refresh();
    } catch {
      toast.error("Falha na comunicação com o servidor");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
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
                      loading="eager"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (isImage && versao && img.src !== versao.caminhoDoArquivo) {
                          img.src = versao.caminhoDoArquivo;
                        }
                      }}
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

                  {/* Ações principais */}
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
                        title="Arquivar (oculta mas mantém arquivo)"
                      >
                        {actionLoadingId === asset.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Ações administrativas: editar + excluir */}
                  {mostrarAcoesAdmin && (
                    <div className="flex gap-2 border-t border-border pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => abrirEdicao(asset)}
                        disabled={actionLoadingId === asset.id}
                        className="flex-1 text-xs praise-touch"
                        aria-label={`Editar ${asset.nome}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExcluindo(asset)}
                        disabled={actionLoadingId === asset.id}
                        className="flex-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive praise-touch"
                        aria-label={`Excluir ${asset.nome}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Modal de edição */}
      <Dialog open={!!editando} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar mídia</DialogTitle>
            <DialogDescription>
              Altere os metadados abaixo. Para substituir o arquivo, envie uma nova versão pelo botão de upload.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input
                id="edit-nome"
                value={editForm.nome}
                onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))}
                className="praise-touch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-visibilidade">Visibilidade</Label>
              <Select
                value={editForm.visibilidade}
                onValueChange={(v) => setEditForm((f) => ({ ...f, visibilidade: v as "publico" | "privado" }))}
              >
                <SelectTrigger id="edit-visibilidade" className="praise-touch">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publico">Público (visível na página de download)</SelectItem>
                  <SelectItem value="privado">Privado (apenas admin vê)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-texto">Texto de divulgação (opcional)</Label>
              <Textarea
                id="edit-texto"
                value={editForm.textoDeDivulgacao}
                onChange={(e) => setEditForm((f) => ({ ...f, textoDeDivulgacao: e.target.value }))}
                placeholder="Ex.: Próximo culto — domingo 19h. Venha adorar conosco!"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-obs">Observações internas (opcional)</Label>
              <Textarea
                id="edit-obs"
                value={editForm.observacoes}
                onChange={(e) => setEditForm((f) => ({ ...f, observacoes: e.target.value }))}
                placeholder="Anotações internas (não exibidas publicamente)…"
                rows={2}
              />
            </div>

            {/* Substituir arquivo */}
            <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="font-medium">Substituir arquivo</Label>
                {editando?.versaoOficial && (
                  <Badge variant="outline" className="border-0 bg-muted text-muted-foreground text-[10px]">
                    Versão atual: v{editando.versaoOficial.numeroDaVersao}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione um novo arquivo para criar uma nova versão (v{(editando?.versaoAtual ?? 0) + 1}).
                A versão atual será preservada no histórico mas a nova passará a ser a oficial.
              </p>
              {substituirPreview && (
                <div className="overflow-hidden rounded-md border border-border">
                  <img src={substituirPreview} alt="Pré-visualização" className="aspect-video w-full object-cover" />
                </div>
              )}
              {substituirArquivo ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card p-2 text-xs">
                  <span className="truncate">{substituirArquivo.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => selecionarSubstituto(null)}
                    className="h-7 px-2"
                    disabled={substituindo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full praise-touch"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/png,image/jpeg,image/webp,image/gif,application/pdf,video/mp4,application/zip";
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) selecionarSubstituto(f);
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Selecionar novo arquivo
                </Button>
              )}
              {substituirArquivo && (
                <Button
                  type="button"
                  size="sm"
                  className="w-full praise-touch"
                  onClick={substituirArquivoAtual}
                  disabled={substituindo}
                >
                  {substituindo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando nova versão…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Enviar nova versão (v{(editando?.versaoAtual ?? 0) + 1})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)} disabled={actionLoadingId === editando?.id}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicao} disabled={actionLoadingId === editando?.id}>
              {actionLoadingId === editando?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!excluindo} onOpenChange={(open) => !open && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mídia definitivamente?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Você está prestes a excluir <strong>{excluindo?.nome}</strong>
                  {excluindo?.versoes?.length ? ` (${excluindo.versoes.length} versão(ões))` : ""}.
                </p>
                <p className="text-destructive">
                  ⚠️ Esta ação é <strong>irreversível</strong>: o arquivo físico será apagado do servidor e
                  o registro será removido do banco. Todos os downloads deste arquivo deixarão de funcionar.
                </p>
                <p className="text-xs">
                  Se quiser apenas ocultar temporariamente, use o botão <em>Arquivar</em> em vez disso.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoadingId === excluindo?.id}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              disabled={actionLoadingId === excluindo?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoadingId === excluindo?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Excluindo…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Sim, excluir definitivamente
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
