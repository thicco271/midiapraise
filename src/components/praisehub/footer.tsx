"use client";

import Link from "next/link";
import { Church, Heart } from "lucide-react";

export function Footer() {
  const ano = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <div className="praise-container py-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <Church className="h-4 w-4" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-foreground">ADSA Reimberg Mídias</p>
              <p className="text-xs text-muted-foreground">
                Central de Mídia ADSA Reimberg · {ano}
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Rodapé">
            <Link href="/" className="hover:text-foreground">Início</Link>
            <Link href="/eventos" className="hover:text-foreground">Eventos</Link>
            <Link href="/historico" className="hover:text-foreground">Histórico</Link>
            <Link href="/login" className="hover:text-foreground">Área administrativa</Link>
          </nav>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          Feito com <Heart className="h-3 w-3 fill-praise-gold text-praise-gold" aria-hidden="true" /> para a equipe de mídia
        </p>
      </div>
    </footer>
  );
}
