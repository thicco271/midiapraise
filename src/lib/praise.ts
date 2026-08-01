// PraiseHub - Utilitários compartilhados

import type { EventStatus } from "@/types";

/** Slug seguro a partir de texto livre */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Garante slug único considerando registros existentes */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "evento";
  let candidate = root;
  let counter = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${counter}`;
    counter++;
  }
  return candidate;
}

/** Formata data ISO em pt-BR considerando fuso America/Sao_Paulo.
 *  Caso a string ISO seja somente data (YYYY-MM-DD) sem hora, interpreta como meia-noite LOCAL. */
export function formatarData(iso: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  let d: Date;
  if (typeof iso === "string") {
    // Se for YYYY-MM-DD puro, montar como data local para evitar offset de fuso
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, day] = iso.split("-").map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(iso);
    }
  } else {
    d = iso;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function formatarDataLonga(iso: string | Date): string {
  return formatarData(iso, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function diaDaSemana(iso: string | Date): string {
  return formatarData(iso, { weekday: "long" });
}

export function formatarHorario(hhmm: string | null | undefined): string {
  if (!hhmm) return "--:--";
  const [h, m] = hhmm.split(":");
  if (!h || !m) return "--:--";
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

/** Próximo culto: publicado, futuro, mais próximo da data atual OU com destaque manual */
export function selecionarProximoCulto<T extends { data: string | Date; destaqueManual?: boolean; status: string }>(
  eventos: T[],
  agora = new Date(),
): T | null {
  const publicados = eventos.filter((e) => e.status === "publicado");
  if (publicados.length === 0) return null;

  const destacados = publicados.filter((e) => e.destaqueManual);
  if (destacados.length > 0) {
    const futuros = destacados.filter((e) => new Date(e.data) >= agora);
    if (futuros.length > 0) {
      return futuros.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];
    }
    return destacados[0];
  }

  const futuros = publicados
    .filter((e) => new Date(e.data) >= agora)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  if (futuros.length > 0) return futuros[0];

  // Sem eventos futuros: retorna o último passado publicado
  return publicados
    .filter((e) => new Date(e.data) < agora)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0] ?? null;
}

export const STATUS_LABEL: Record<EventStatus, string> = {
  rascunho: "Rascunho",
  em_producao: "Em produção",
  aguardando_aprovacao: "Aguardando aprovação",
  ajustes_solicitados: "Ajustes solicitados",
  aprovado: "Aprovado",
  programado: "Programado",
  publicado: "Publicado",
  encerrado: "Encerrado",
  arquivado: "Arquivado",
  cancelado: "Cancelado",
};

export const STATUS_COLOR: Record<EventStatus, string> = {
  rascunho: "bg-slate-200 text-slate-700",
  em_producao: "bg-blue-100 text-blue-700",
  aguardando_aprovacao: "bg-amber-100 text-amber-700",
  ajustes_solicitados: "bg-orange-100 text-orange-700",
  aprovado: "bg-emerald-100 text-emerald-700",
  programado: "bg-cyan-100 text-cyan-700",
  publicado: "bg-emerald-600 text-white",
  encerrado: "bg-slate-300 text-slate-700",
  arquivado: "bg-slate-100 text-slate-500",
  cancelado: "bg-red-100 text-red-700",
};

export function semanaAtual(): { inicio: Date; fim: Date } {
  const agora = new Date();
  const inicio = new Date(agora);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(agora);
  fim.setDate(fim.getDate() + 7);
  fim.setHours(23, 59, 59, 999);
  return { inicio, fim };
}

export function isFutura(iso: string | Date): boolean {
  return new Date(iso).getTime() >= Date.now();
}
