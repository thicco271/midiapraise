"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Upload,
  Loader2,
  Trash2,
  Star,
  Pencil,
  X,
  GripVertical,
  Images,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AlbumPhotoDTO } from "@/types";

interface AlbumPhotoManagerProps {
  albumId: string;
  fotosIniciais: AlbumPhotoDTO[];
  capaPhotoId?: string | null;
}

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  previewUrl?: string;
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AlbumPhotoManager({ albumId, fotosIniciais, capaPhotoId }: AlbumPhotoManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingAll, setUploadingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edição de legenda
  const [editandoFoto, setEditandoFoto] = useState<AlbumPhotoDTO | null>(null);
  const [legendaEdit, setLegendaEdit] = useState("");
  const [salvandoLegenda, setSalvandoLegenda] = useState(false);

  // Exclusão
  const [excluindoFoto, setExcluindoFoto] = useState<AlbumPhotoDTO | null>(null);
  const [excluindoLoading, setExcluindoLoading] = useState(false);

  // Drag and drop para reordenar
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [salvandoOrdem, setSalvandoOrdem] = useState(false);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const novos: UploadItem[] = arr.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      progress: 0,
      status: "pending",
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    setItems((prev) => [...prev, ...novos]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removerItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const uploadTudo = async () => {
    const pendentes = items.filter((i) => i.status === "pending" || i.status === "error");
    if (pendentes.length === 0) {
      toast.info("Não há arquivos pendentes");
      return;
    }

    setUploadingAll(true);
    toast.info(`Enviando ${pendentes.length} foto(s)…`);

    try {
      const formData = new FormData();
      for (const item of pendentes) {
        formData.append("files", item.file);
      }

      // Marca como uploading
      setItems((prev) =>
        prev.map((i) =>
          pendentes.some((p) => p.id === i.id) ? { ...i, status: "uploading", progress: 50 } : i,
        ),
      );

      const res = await fetch(`/api/albums/${albumId}/upload`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json();

      if (!res.ok || !body?.ok) {
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      // Marca todos como done
      setItems((prev) =>
        prev.map((i) =>
          pendentes.some((p) => p.id === i.id) ? { ...i, status: "done", progress: 100 } : i,
        ),
      );

      const fotosCriadas = body.data?.fotos?.length ?? 0;
      const falhas = body.data?.falhas ?? [];

      toast.success(`${fotosCriadas} foto(s) enviada(s)!`);
      if (falhas.length > 0) {
        toast.warning(`${falhas.length} arquivo(s) com falha: ${falhas.map((f: any) => f.nome).join(", ")}`);
      }

      // Limpa concluídos e atualiza a página
      setTimeout(() => {
        setItems((prev) => {
          prev.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
          return [];
        });
        router.refresh();
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha no upload";
      setItems((prev) =>
        prev.map((i) =>
          i.status === "uploading" ? { ...i, status: "error", error: msg, progress: 0 } : i,
        ),
      );
      toast.error(`Falha: ${msg}`);
    } finally {
      setUploadingAll(false);
    }
  };

  const definirCapa = async (foto: AlbumPhotoDTO) => {
    try {
      const res = await fetch(`/api/albums/${albumId}/photos/${foto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ definirCapa: true }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao definir capa");
        return;
      }
      toast.success("Capa definida!");
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    }
  };

  const abrirEdicaoLegenda = (foto: AlbumPhotoDTO) => {
    setEditandoFoto(foto);
    setLegendaEdit(foto.legenda ?? "");
  };

  const salvarLegenda = async () => {
    if (!editandoFoto) return;
    setSalvandoLegenda(true);
    try {
      const res = await fetch(`/api/albums/${albumId}/photos/${editandoFoto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legenda: legendaEdit }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao salvar legenda");
        return;
      }
      toast.success("Legenda atualizada!");
      setEditandoFoto(null);
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    } finally {
      setSalvandoLegenda(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!excluindoFoto) return;
    setExcluindoLoading(true);
    try {
      const res = await fetch(`/api/albums/${albumId}/photos/${excluindoFoto.id}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao excluir");
        return;
      }
      toast.success(`Foto excluída (${body.data?.apagados ?? 0} arquivos apagados)`);
      setExcluindoFoto(null);
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    } finally {
      setExcluindoLoading(false);
    }
  };

  // Reordenação por drag
  const handleDragStart = (foto: AlbumPhotoDTO) => (e: React.DragEvent) => {
    setDraggedId(foto.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (foto: AlbumPhotoDTO) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId !== foto.id) {
      setDragOverId(foto.id);
    }
  };

  const handleDropReorder = (foto: AlbumPhotoDTO) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId || draggedId === foto.id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Reordena localmente
    const novasFotos = [...fotosIniciais];
    const fromIdx = novasFotos.findIndex((f) => f.id === draggedId);
    const toIdx = novasFotos.findIndex((f) => f.id === foto.id);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const [moved] = novasFotos.splice(fromIdx, 1);
    novasFotos.splice(toIdx, 0, moved);

    // Persiste novas ordens (sequencial a partir de 0)
    setSalvandoOrdem(true);
    try {
      const reordenar = novasFotos.map((f, i) => ({ id: f.id, ordem: i }));
      const res = await fetch(`/api/albums/${albumId}/photos/${draggedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reordenar }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error("Falha ao reordenar");
        return;
      }
      toast.success("Ordem atualizada!");
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    } finally {
      setSalvandoOrdem(false);
      setDraggedId(null);
      setDragOverId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Images className="h-4 w-4 text-praise-gold" aria-hidden="true" />
              Fotos do álbum
            </span>
            {fotosIniciais.length > 0 && (
              <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
                {fotosIniciais.length} foto{fotosIniciais.length === 1 ? "" : "s"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
              "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-muted/30",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleInputChange}
              className="sr-only"
              aria-label="Selecionar fotos"
            />
            <div className="flex flex-col items-center gap-2">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-foreground">
                Arraste fotos aqui ou{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  selecione do dispositivo
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP, GIF, HEIC · máx. 30 MB por foto · seleção múltipla
              </p>
            </div>
          </div>

          {/* Lista de arquivos pendentes */}
          {items.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pendentes ({items.filter((i) => i.status !== "done").length})
              </p>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-card p-2 text-sm"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.previewUrl ? (
                        <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{item.file.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatarTamanho(item.file.size)}
                        {item.status === "done" && " · ✓ enviado"}
                        {item.status === "error" && ` · ✗ ${item.error}`}
                      </p>
                    </div>
                    {item.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : item.status === "uploading" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerItem(item.id)}
                        className="h-8 w-8"
                        aria-label="Remover"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              {items.some((i) => i.status === "pending" || i.status === "error") && (
                <Button onClick={uploadTudo} disabled={uploadingAll} className="w-full praise-touch">
                  {uploadingAll ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Enviar {items.filter((i) => i.status === "pending" || i.status === "error").length} foto(s)
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Grid de fotos existentes (com drag para reordenar) */}
          {fotosIniciais.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Fotos no álbum
                </p>
                {salvandoOrdem && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Salvando ordem…
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Arraste as fotos para reordenar. A primeira foto pode ser definida como capa.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
                {fotosIniciais.map((foto, idx) => {
                  const isCapa = capaPhotoId === foto.id;
                  const isDragged = draggedId === foto.id;
                  const isDragOver = dragOverId === foto.id;
                  return (
                    <div
                      key={foto.id}
                      draggable
                      onDragStart={handleDragStart(foto)}
                      onDragOver={handleDragOver(foto)}
                      onDrop={handleDropReorder(foto)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-lg border-2 bg-card transition-all",
                        isCapa ? "border-praise-gold" : "border-border",
                        isDragged && "opacity-40",
                        isDragOver && "border-primary border-dashed scale-105",
                      )}
                    >
                      {foto.caminhoThumbnail ? (
                        <img
                          src={foto.caminhoThumbnail}
                          alt={foto.legenda ?? foto.nomeOriginal}
                          className="h-full w-full object-cover"
                          loading="eager"
                          onError={(e) => {
                            // Tenta otimizado, depois original
                            const img = e.currentTarget;
                            if (img.src !== foto.caminhoOtimizado && foto.caminhoOtimizado) {
                              img.src = foto.caminhoOtimizado;
                            } else if (img.src !== foto.caminhoOriginal) {
                              img.src = foto.caminhoOriginal;
                            }
                          }}
                        />
                      ) : foto.caminhoOtimizado ? (
                        <img
                          src={foto.caminhoOtimizado}
                          alt={foto.legenda ?? foto.nomeOriginal}
                          className="h-full w-full object-cover"
                          loading="eager"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.src !== foto.caminhoOriginal) {
                              img.src = foto.caminhoOriginal;
                            }
                          }}
                        />
                      ) : (
                        <img
                          src={foto.caminhoOriginal}
                          alt={foto.legenda ?? foto.nomeOriginal}
                          className="h-full w-full object-cover"
                          loading="eager"
                        />
                      )}

                      {/* Indicador de arrastar */}
                      <div className="absolute left-1 top-1 cursor-grab text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-black/50 backdrop-blur">
                          <GripVertical className="h-3 w-3" />
                        </span>
                      </div>

                      {/* Badge de capa */}
                      {isCapa && (
                        <div className="absolute right-1 top-1">
                          <Badge variant="outline" className="border-0 bg-praise-gold text-white">
                            <Star className="mr-1 h-2.5 w-2.5 fill-current" />
                            Capa
                          </Badge>
                        </div>
                      )}

                      {/* Ações hover */}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            definirCapa(foto);
                          }}
                          disabled={isCapa}
                          aria-label="Definir como capa"
                          title="Definir como capa"
                        >
                          <Star className={cn("h-4 w-4", isCapa && "fill-current")} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirEdicaoLegenda(foto);
                          }}
                          aria-label="Editar legenda"
                          title="Editar legenda"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-destructive/80 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExcluindoFoto(foto);
                          }}
                          aria-label="Excluir foto"
                          title="Excluir foto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Legenda se existir */}
                      {foto.legenda && (
                        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-1.5">
                          <p className="line-clamp-1 text-[10px] text-white">{foto.legenda}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal editar legenda */}
      <Dialog open={!!editandoFoto} onOpenChange={(open) => !open && setEditandoFoto(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar legenda</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {editandoFoto?.caminhoThumbnail && (
              <div className="overflow-hidden rounded-md">
                <img src={editandoFoto.caminhoThumbnail} alt="" className="aspect-video w-full object-cover" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="legenda">Legenda (opcional)</Label>
              <Textarea
                id="legenda"
                value={legendaEdit}
                onChange={(e) => setLegendaEdit(e.target.value)}
                placeholder="Ex.: Momento de adoração durante o culto…"
                rows={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Arquivo: {editandoFoto?.nomeOriginal}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditandoFoto(null)} disabled={salvandoLegenda}>
              Cancelar
            </Button>
            <Button onClick={salvarLegenda} disabled={salvandoLegenda}>
              {salvandoLegenda ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação exclusão */}
      <AlertDialog open={!!excluindoFoto} onOpenChange={(open) => !open && setExcluindoFoto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  A foto <strong>{excluindoFoto?.nomeOriginal}</strong> será excluída definitivamente.
                </p>
                <p className="text-destructive">
                  ⚠️ Ação irreversível: arquivo físico + registro serão apagados.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindoLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              disabled={excluindoLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {excluindoLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Excluindo…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Sim, excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
