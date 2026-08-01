"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/praisehub/status-badge";
import { formatarHorario } from "@/lib/praise";
import { ChevronRight, Star, Trash2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (eventos.length === 0) return null;

  const excluir = async (e: EventoLinha, definitivo: boolean) => {
    const acao = definitivo ? "excluir definitivamente" : "arquivar";
    if (!confirm(`Tem certeza que deseja ${acao} o evento "${e.nome}"?${definitivo ? "\n\nTodos os arquivos vinculados serão apagados. Ação irreversível!" : ""}`)) {
      return;
    }
    setLoadingId(e.id);
    try {
      const url = definitivo
        ? `/api/events/${e.id}?definitivo=true`
        : `/api/events/${e.id}`;
      const res = await fetch(url, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao excluir");
        return;
      }
      toast.success(definitivo ? `Excluído definitivamente (${body.data?.arquivos ?? 0} arquivos)` : "Arquivado");
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    } finally {
      setLoadingId(null);
    }
  };

  const duplicar = async (e: EventoLinha) => {
    setLoadingId(e.id);
    try {
      const res = await fetch(`/api/events/${e.id}`);
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error("Falha ao buscar");
        return;
      }
      const original = body.data;
      const criar = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: `${original.nome} (cópia)`,
          categoriaId: original.categoriaId || null,
          descricao: original.descricao || null,
          data: original.data,
          horarioInicio: original.horarioInicio,
          horarioFim: original.horarioFim || null,
          local: original.local || null,
          tema: original.tema || null,
          versiculo: original.versiculo || null,
          pregador: original.pregador || null,
          status: "rascunho",
          visibilidade: original.visibilidade,
          destaqueManual: false,
        }),
      });
      const criarBody = await criar.json();
      if (!criar.ok || !criarBody?.ok) {
        toast.error("Falha ao duplicar");
        return;
      }
      toast.success("Evento duplicado!");
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {eventos.map((e) => (
            <li key={e.id}>
              <div className="flex flex-col gap-2 p-3 hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4">
                <Link href={`/admin/eventos/${e.id}`} className="flex flex-1 items-center gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                    <span className="text-xs font-bold">{String(new Date(e.data).getDate()).padStart(2, "0")}</span>
                    <span className="text-[9px] uppercase">
                      {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(e.data)).replace(".", "")}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{e.nome}</p>
                      {e.destaqueManual && <Star className="h-3 w-3 fill-praise-gold text-praise-gold" />}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.categoriaNome} · {formatarHorario(e.horarioInicio)}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicar(e)}
                    disabled={loadingId === e.id}
                    title="Duplicar"
                  >
                    {loadingId === e.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => excluir(e, false)}
                    disabled={loadingId === e.id}
                    title="Arquivar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => excluir(e, true)}
                    disabled={loadingId === e.id}
                    title="Excluir definitivamente"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
