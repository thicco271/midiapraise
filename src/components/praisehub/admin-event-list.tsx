"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/praisehub/status-badge";
import { formatarData, formatarHorario, diaDaSemana } from "@/lib/praise";
import { ChevronRight, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventStatus } from "@/types";

interface EventoLinha {
  id: string;
  nome: string;
  slug: string;
  categoriaNome: string;
  data: string;
  horarioInicio: string;
  status: EventStatus;
  destaqueManual: boolean;
  criadoPorNome: string;
}

export function AdminEventList({ eventos }: { eventos: EventoLinha[] }) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const filtrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return eventos.filter((e) => {
      const matchBusca =
        !b ||
        e.nome.toLowerCase().includes(b) ||
        e.categoriaNome.toLowerCase().includes(b) ||
        e.criadoPorNome.toLowerCase().includes(b);
      const matchStatus = filtroStatus === "todos" || e.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [eventos, busca, filtroStatus]);

  if (eventos.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Buscar evento, categoria ou criador…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 praise-touch"
            aria-label="Buscar eventos"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="sm:w-[220px] praise-touch" aria-label="Filtrar por status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="em_producao">Em produção</SelectItem>
            <SelectItem value="aguardando_aprovacao">Aguardando aprovação</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {filtrados.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/admin/eventos/${e.id}`}
                  className="flex flex-col gap-2 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex w-28 shrink-0 items-center gap-2">
                    <span className="inline-flex h-10 w-10 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                      <span className="text-xs font-bold leading-none">
                        {String(new Date(e.data).getDate()).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] uppercase leading-none">
                        {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(e.data)).replace(".", "")}
                      </span>
                    </span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {formatarHorario(e.horarioInicio)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{e.nome}</p>
                      {e.destaqueManual && (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-praise-gold text-praise-gold" aria-label="Destaque manual" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.categoriaNome} · criado por {e.criadoPorNome}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={e.status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                </Link>
              </li>
            ))}
            {filtrados.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">
                Nenhum evento encontrado com esses filtros.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
