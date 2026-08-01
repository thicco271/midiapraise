"use client";

import { useRouter } from "next/navigation";

interface AnoFiltroProps {
  anos: number[];
  anoAtual?: number;
}

export function AnoFiltro({ anos, anoAtual }: AnoFiltroProps) {
  const router = useRouter();
  return (
    <select
      aria-label="Filtrar por ano"
      defaultValue={anoAtual ? String(anoAtual) : ""}
      onChange={(e) => {
        const params = new URLSearchParams(window.location.search);
        if (e.target.value) params.set("ano", e.target.value);
        else params.delete("ano");
        router.push(`/historico?${params.toString()}`);
      }}
      className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring praise-touch"
    >
      <option value="">Todos</option>
      {anos.map((a) => (
        <option key={a} value={a}>{a}</option>
      ))}
    </select>
  );
}
