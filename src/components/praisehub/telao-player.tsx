"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Church,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { formatarDataLonga, formatarHorario, diaDaSemana } from "@/lib/praise";

interface TelaoMedia {
  id: string;
  nome: string;
  caminhoDoArquivo: string;
  caminhoThumbnail?: string | null;
  nomePadronizado: string;
  largura?: number | null;
  altura?: number | null;
}

interface EventoInfo {
  id: string;
  nome: string;
  slug: string;
  data: string;
  horarioInicio: string;
  horarioFim?: string | null;
  local?: string | null;
  endereco?: string | null;
  tema?: string | null;
  versiculo?: string | null;
  pregador?: string | null;
  categoria?: { nome: string } | null;
}

interface TelaoPlayerProps {
  evento: EventoInfo | null;
  medias: TelaoMedia[];
  proximoEvento?: EventoInfo | null;
}

export function TelaoPlayer({ evento, medias, proximoEvento }: TelaoPlayerProps) {
  const [indexAtual, setIndexAtual] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const eventoAtivo = evento ?? proximoEvento;
  const temImagem = medias.length > 0;

  // Auto-avanço a cada 8 segundos (se houver múltiplas imagens e autoplay ligado)
  useEffect(() => {
    if (!temImagem || medias.length <= 1 || !autoplay) return;
    const timer = setInterval(() => {
      setIndexAtual((i) => (i + 1) % medias.length);
      setLoading(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [temImagem, medias.length, autoplay]);

  // Detectar mudança de fullscreen
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen não suportado:", err);
    }
  }, []);

  // Atalhos de teclado
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      setIndexAtual((i) => (i + 1) % medias.length);
      setLoading(true);
    } else if (e.key === "ArrowLeft") {
      setIndexAtual((i) => (i - 1 + medias.length) % medias.length);
      setLoading(true);
    } else if (e.key === "f" || e.key === "F") {
      toggleFullscreen();
    } else if (e.key === " ") {
      e.preventDefault();
      setAutoplay((a) => !a);
    } else if (e.key === "Escape" && isFullscreen) {
      // navegador já sai do fullscreen, só atualiza estado
      setIsFullscreen(false);
    }
  }, [medias.length, isFullscreen, toggleFullscreen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const irPara = (delta: number) => {
    if (!temImagem) return;
    setIndexAtual((i) => (i + delta + medias.length) % medias.length);
    setLoading(true);
  };

  const mediaAtual = temImagem ? medias[indexAtual] : null;

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-black"
    >
      {/* CONTEÚDO PRINCIPAL — imagem ou tela branca */}
      {temImagem && mediaAtual ? (
        <>
          {/* Imagem do telão */}
          <div className="absolute inset-0 flex items-center justify-center">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <Loader2 className="h-12 w-12 animate-spin text-white/60" aria-hidden="true" />
              </div>
            )}
            <img
              src={mediaAtual.caminhoDoArquivo}
              alt={`Arte do telão: ${mediaAtual.nome}`}
              className={`max-h-full max-w-full object-contain transition-opacity duration-500 ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              key={mediaAtual.id}
            />
          </div>

          {/* Overlay sutil com info do culto (aparece ao mover mouse) */}
          <CultoOverlay evento={eventoAtivo} versiculo={eventoAtivo?.versiculo} />
        </>
      ) : (
        /* TELA BRANCA quando não há banner */
        <TelaBranca evento={eventoAtivo} />
      )}

      {/* Controles (somente quando não estiver em fullscreen OU mouse ativo) */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
        {temImagem && medias.length > 1 && (
          <button
            type="button"
            onClick={() => setAutoplay((a) => !a)}
            className="rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80"
            aria-label={autoplay ? "Pausar rotação" : "Iniciar rotação"}
            title="Espaço = pausar/retomar rotação"
          >
            {autoplay ? "⏸ Pausar" : "▶ Retomar"}
          </button>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-md bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-black/80"
          aria-label={isFullscreen ? "Sair de tela cheia" : "Tela cheia"}
          title="F = tela cheia"
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Setas de navegação (somente se houver múltiplas imagens) */}
      {temImagem && medias.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => irPara(-1)}
            className="absolute left-4 top-1/2 z-40 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur transition-all hover:bg-black/60 hover:scale-110"
            aria-label="Imagem anterior"
            title="← = anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => irPara(1)}
            className="absolute right-4 top-1/2 z-40 translate-y-0 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur transition-all hover:bg-black/60 hover:scale-110"
            aria-label="Próxima imagem"
            title="→ = próxima"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicador de página */}
          <div className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
            {indexAtual + 1} / {medias.length}
          </div>
        </>
      )}

      {/* Botão voltar (somente fora de fullscreen) */}
      {!isFullscreen && eventoAtivo && (
        <Link
          href={`/eventos/${eventoAtivo.slug}`}
          className="absolute left-4 top-4 z-50 inline-flex items-center gap-2 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Link>
      )}

      {/* Dica de uso (some após 5s) */}
      {!isFullscreen && temImagem && (
        <DicaUso />
      )}
    </div>
  );
}

// Overlay com info do culto que aparece no canto (sutil, no canto inferior)
function CultoOverlay({
  evento,
  versiculo,
}: {
  evento: EventoInfo | null;
  versiculo?: string | null;
}) {
  const [visivel, setVisivel] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleMove = () => {
      setVisivel(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisivel(false), 3000);
    };
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!evento) return null;

  return (
    <div
      className={`absolute bottom-4 right-4 z-30 max-w-md rounded-lg bg-gradient-to-br from-black/80 to-black/60 p-4 text-white backdrop-blur transition-opacity duration-500 ${
        visivel ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-praise-gold">
        {evento.categoria?.nome ?? "Culto"}
      </p>
      <p className="mt-1 text-lg font-bold">{evento.nome}</p>
      <div className="mt-2 space-y-1 text-xs text-white/80">
        <p className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          <span className="capitalize">{diaDaSemana(evento.data)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatarDataLonga(evento.data)}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {formatarHorario(evento.horarioInicio)}
          {evento.horarioFim && ` – ${formatarHorario(evento.horarioFim)}`}
        </p>
        {evento.local && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {evento.local}
          </p>
        )}
        {evento.pregador && (
          <p className="flex items-center gap-1.5">
            <User className="h-3 w-3" aria-hidden="true" />
            {evento.pregador}
          </p>
        )}
      </div>
      {versiculo && (
        <p className="mt-2 flex items-start gap-1.5 border-t border-white/20 pt-2 text-xs italic">
          <BookOpen className="mt-0.5 h-3 w-3 shrink-0 text-praise-gold" aria-hidden="true" />
          {versiculo}
        </p>
      )}
    </div>
  );
}

// Tela branca quando não há imagem de telão publicada
function TelaBranca({ evento }: { evento: EventoInfo | null }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-8 text-center">
      <div className="mb-8">
        <Church className="mx-auto h-16 w-16 text-primary/30" aria-hidden="true" />
      </div>

      {evento ? (
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-widest text-praise-gold">
            {evento.categoria?.nome ?? "Culto"}
          </p>
          <h1 className="font-serif text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
            {evento.nome}
          </h1>

          {evento.tema && (
            <p className="text-xl italic text-muted-foreground sm:text-2xl">
              &ldquo;{evento.tema}&rdquo;
            </p>
          )}

          <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-base text-foreground">
            <p className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-praise-gold" aria-hidden="true" />
              <span className="capitalize">{diaDaSemana(evento.data)}</span>
              <span aria-hidden="true">·</span>
              <span>{formatarDataLonga(evento.data)}</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-praise-gold" aria-hidden="true" />
              {formatarHorario(evento.horarioInicio)}
              {evento.horarioFim && ` – ${formatarHorario(evento.horarioFim)}`}
            </p>
          </div>

          {evento.local && (
            <p className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {evento.local}
            </p>
          )}

          {evento.pregador && (
            <p className="flex items-center justify-center gap-2 pt-2 text-base text-foreground">
              <User className="h-4 w-4 text-praise-gold" aria-hidden="true" />
              {evento.pregador}
            </p>
          )}

          {evento.versiculo && (
            <p className="mx-auto mt-6 max-w-md rounded-lg bg-secondary/60 px-4 py-2 text-sm italic text-foreground">
              &ldquo;{evento.versiculo}&rdquo;
            </p>
          )}
        </div>
      ) : (
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Aguardando próximo culto
          </h1>
          <p className="text-sm text-muted-foreground">
            Não há culto programado no momento.
          </p>
        </div>
      )}

      {/* Aviso no rodapé */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <ImageIcon className="h-3 w-3" aria-hidden="true" />
          Sem arte de telão publicada para este culto
        </p>
      </div>
    </div>
  );
}

// Dica de uso que desaparece após 5 segundos
function DicaUso() {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisivel(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visivel) return null;

  return (
    <div className="absolute bottom-4 right-4 z-50 max-w-xs rounded-lg bg-black/80 p-3 text-xs text-white backdrop-blur">
      <p className="font-semibold">Atalhos:</p>
      <ul className="mt-1 space-y-0.5 text-white/80">
        <li><kbd className="rounded bg-white/20 px-1">←</kbd> <kbd className="rounded bg-white/20 px-1">→</kbd> navegar</li>
        <li><kbd className="rounded bg-white/20 px-1">F</kbd> tela cheia</li>
        <li><kbd className="rounded bg-white/20 px-1">Espaço</kbd> pausar/retomar</li>
      </ul>
    </div>
  );
}
