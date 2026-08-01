"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";

interface AlbumViewerFoto {
  id: string;
  caminhoOriginal: string;
  caminhoOtimizado?: string | null;
  caminhoThumbnail?: string | null;
  nomeOriginal: string;
  legenda?: string | null;
  ordem: number;
  permitirDownload: boolean;
}

interface AlbumViewerProps {
  fotos: (AlbumViewerFoto & { permitirDownload?: boolean })[];
}

export function AlbumViewer({ fotos }: AlbumViewerProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const abrir = (i: number) => setLightboxIndex(i);
  const fechar = useCallback(() => setLightboxIndex(null), []);
  const anterior = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length));
  }, [fotos.length]);
  const proximo = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % fotos.length));
  }, [fotos.length]);

  // Navegação por teclado
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowLeft") anterior();
      else if (e.key === "ArrowRight") proximo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, fechar, anterior, proximo]);

  const fotoAtual = lightboxIndex !== null ? fotos[lightboxIndex] : null;

  const baixar = (foto: AlbumViewerFoto) => {
    const a = document.createElement("a");
    a.href = foto.caminhoOriginal;
    a.download = foto.nomeOriginal;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Download: ${foto.nomeOriginal}`);
  };

  return (
    <>
      {/* Grid de fotos */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
        {fotos.map((foto, i) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => abrir(i)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Abrir foto ${i + 1}: ${foto.legenda ?? foto.nomeOriginal}`}
          >
            {foto.caminhoThumbnail ? (
              <img
                src={foto.caminhoThumbnail}
                alt={foto.legenda ?? foto.nomeOriginal}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : foto.caminhoOtimizado ? (
              <img
                src={foto.caminhoOtimizado}
                alt={foto.legenda ?? foto.nomeOriginal}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <img
                src={foto.caminhoOriginal}
                alt={foto.legenda ?? foto.nomeOriginal}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/30 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && fechar()}>
        <DialogContent
          className="max-w-5xl border-0 bg-black/95 p-0 sm:rounded-xl"
          aria-label="Visualização ampliada"
        >
          <DialogTitle className="sr-only">
            Foto {lightboxIndex !== null ? lightboxIndex + 1 : 0} de {fotos.length}
          </DialogTitle>

          {fotoAtual && (
            <div className="relative flex h-[85vh] w-full flex-col items-center justify-center">
              {/* Botão fechar */}
              <Button
                variant="ghost"
                size="icon"
                onClick={fechar}
                className="absolute right-3 top-3 z-20 h-10 w-10 text-white hover:bg-white/10 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Anterior */}
              {fotos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={anterior}
                  className="absolute left-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {/* Próximo */}
              {fotos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={proximo}
                  className="absolute right-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Imagem */}
              <div className="flex h-full w-full items-center justify-center p-4">
                <img
                  src={fotoAtual.caminhoOtimizado ?? fotoAtual.caminhoOriginal}
                  alt={fotoAtual.legenda ?? fotoAtual.nomeOriginal}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Legenda + ações */}
              {(fotoAtual.legenda || fotoAtual.permitirDownload !== false) && (
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="min-w-0 flex-1 text-sm text-white">
                    {fotoAtual.legenda && <p className="line-clamp-2">{fotoAtual.legenda}</p>}
                    <p className="text-xs text-white/60">{fotoAtual.nomeOriginal}</p>
                  </div>
                  {fotoAtual.permitirDownload !== false && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => baixar(fotoAtual)}
                      className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white praise-touch"
                    >
                      <Download className="h-4 w-4" />
                      Baixar
                    </Button>
                  )}
                </div>
              )}

              {/* Contador */}
              <div className="absolute right-3 top-3 z-10 hidden rounded-full bg-black/60 px-3 py-1 text-xs text-white sm:block">
                {lightboxIndex! + 1} / {fotos.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
