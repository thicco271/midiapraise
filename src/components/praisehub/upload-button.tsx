"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  File as FileIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MediaType } from "@/types";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  previewUrl?: string;
}

interface UploadButtonProps {
  eventoId: string;
  eventoSlug: string;
  tipo: MediaType;
  titulo?: string;
}

const TIPO_LABEL: Record<MediaType, string> = {
  whatsapp: "WhatsApp e Stories",
  rede_social: "Redes sociais",
  banner_telao: "Banner / Telão",
  outros: "Outros arquivos",
};

const TIPO_ACCEPT: Record<MediaType, string> = {
  whatsapp: "image/png,image/jpeg,image/webp",
  rede_social: "image/png,image/jpeg,image/webp",
  banner_telao: "image/png,image/jpeg,image/webp,application/pdf",
  outros: "image/png,image/jpeg,image/webp,image/gif,application/pdf,video/mp4,application/zip",
};

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function gerarPreviewUrl(file: File): string | undefined {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }
  return undefined;
}

export function UploadButton({ eventoId, eventoSlug, tipo, titulo }: UploadButtonProps) {
  const router = useRouter();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const novos: UploadItem[] = arr.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      progress: 0,
      status: "pending",
      previewUrl: gerarPreviewUrl(file),
    }));
    setItems((prev) => [...prev, ...novos]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = ""; // permite re-selecionar mesmo arquivo
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removerItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const uploadItem = async (item: UploadItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: "uploading", progress: 10 } : i)),
    );

    try {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("tipo", tipo);

      // Simula progresso enquanto envia
      const progressInterval = setInterval(() => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id && i.status === "uploading" && i.progress < 90
              ? { ...i, progress: i.progress + 10 }
              : i,
          ),
        );
      }, 200);

      const res = await fetch(`/api/events/${eventoId}/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const body = await res.json();
      if (!res.ok || !body?.ok) {
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "done", progress: 100 } : i,
        ),
      );
      toast.success(`${item.file.name} enviado com sucesso!`);
      // Atualiza a página para mostrar nova mídia
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha no upload";
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "error", error: msg, progress: 0 } : i,
        ),
      );
      toast.error(`Falha ao enviar ${item.file.name}: ${msg}`);
    }
  };

  const uploadTudo = async () => {
    const pendentes = items.filter((i) => i.status === "pending" || i.status === "error");
    if (pendentes.length === 0) {
      toast.info("Não há arquivos pendentes");
      return;
    }
    toast.info(`Enviando ${pendentes.length} arquivo(s)…`);
    for (const item of pendentes) {
      await uploadItem(item);
    }
  };

  const limparConcluidos = () => {
    setItems((prev) => {
      const concluidos = prev.filter((i) => i.status === "done");
      concluidos.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
      return prev.filter((i) => i.status !== "done");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-praise-gold" aria-hidden="true" />
            {titulo ?? `Enviar ${TIPO_LABEL[tipo]}`}
          </span>
          {items.some((i) => i.status === "done") && (
            <Button variant="ghost" size="sm" onClick={limparConcluidos}>
              Limpar concluídos
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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
            accept={TIPO_ACCEPT[tipo]}
            onChange={handleInputChange}
            className="sr-only"
            aria-label={`Selecionar arquivos para ${TIPO_LABEL[tipo]}`}
          />
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-foreground">
              Arraste arquivos aqui ou{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary underline-offset-2 hover:underline"
              >
                selecione do dispositivo
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos: PNG, JPG, WEBP{tipo === "outros" && ", GIF, PDF, MP4, ZIP"} · máx. 50 MB
            </p>
          </div>
        </div>

        {/* Lista de arquivos */}
        {items.length > 0 && (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
              >
                {/* Thumbnail */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {item.previewUrl ? (
                     
                    <img
                      src={item.previewUrl}
                      alt={`Pré-visualização de ${item.file.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatarTamanho(item.file.size)}
                    {item.status === "done" && " · ✓ enviado"}
                    {item.status === "error" && ` · ✗ ${item.error}`}
                  </p>
                  {item.status === "uploading" && (
                    <Progress value={item.progress} className="mt-2 h-1.5" />
                  )}
                </div>

                {/* Ação */}
                <div className="shrink-0">
                  {item.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-label="Concluído" />
                  ) : item.status === "uploading" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Enviando" />
                  ) : item.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-destructive" aria-label="Erro" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removerItem(item.id)}
                      aria-label={`Remover ${item.file.name}`}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Ações */}
        {items.some((i) => i.status === "pending" || i.status === "error") && (
          <Button onClick={uploadTudo} className="w-full praise-touch">
            <Upload className="h-4 w-4" />
            Enviar {items.filter((i) => i.status === "pending" || i.status === "error").length} arquivo(s)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
