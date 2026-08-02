export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Church, Info } from "lucide-react";

export const metadata = {
  title: "Horários dos cultos · ADSA Reimberg Mídias",
  description: "Horários dos cultos e atividades da ADSA Reimberg.",
};

const DIAS_NOMES = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const CATEGORIA_INFO: Record<string, { label: string; className: string }> = {
  culto: { label: "Culto", className: "bg-primary/10 text-primary" },
  ebd: { label: "EBD", className: "bg-praise-gold/20 text-praise-gold" },
  especial: { label: "Especial", className: "bg-emerald-100 text-emerald-700" },
  outro: { label: "Outro", className: "bg-muted text-muted-foreground" },
};

function formatarHorario(h: string | null): string {
  if (!h) return "";
  const [hh, mm] = h.split(":");
  if (!hh) return h;
  return `${hh.padStart(2, "0")}:${(mm ?? "00").padStart(2, "0")}`;
}

export default async function CultosPage() {
  const [cultos, settings] = await Promise.all([
    db.serviceSchedule.findMany({
      where: { ativo: true },
      orderBy: [{ diaSemana: "asc" }, { horarioInicio: "asc" }],
    }),
    db.churchSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  // Agrupar por dia da semana
  const porDia = new Map<number, typeof cultos>();
  for (const c of cultos) {
    if (!porDia.has(c.diaSemana)) porDia.set(c.diaSemana, []);
    porDia.get(c.diaSemana)!.push(c);
  }

  const endereco = settings?.endereco;

  return (
    <div className="praise-container py-8 sm:py-12">
      <header className="mb-8 space-y-3">
        <p className="praise-eyebrow">Nossa agenda</p>
        <h1 className="praise-title">Horários dos cultos</h1>
        <p className="praise-subtitle max-w-2xl">
          Conheça os horários das nossas atividades regulares. Para cultos especiais e festividades,
          acompanhe a página inicial e as redes sociais.
        </p>
      </header>

      {/* Endereço */}
      {endereco && (
        <Card className="mb-8 bg-secondary/40">
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-praise-gold" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-foreground">Endereço</p>
                <p className="text-sm text-muted-foreground">{endereco}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="h-4 w-4" />
                Ver no mapa
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de cultos por dia */}
      {cultos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-semibold">Nenhum horário cadastrado</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Os horários regulares serão exibidos aqui assim que forem cadastrados pela administração.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(porDia.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([dia, lista]) => (
              <Card key={dia} className="praise-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                    {DIAS_NOMES[dia] ?? "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lista.map((c) => {
                    const catInfo = c.categoria ? CATEGORIA_INFO[c.categoria] ?? CATEGORIA_INFO.outro : null;
                    return (
                      <div key={c.id} className="rounded-md border border-border bg-card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-foreground">{c.nome}</p>
                          {catInfo && (
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${catInfo.className}`}>
                              {catInfo.label}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatarHorario(c.horarioInicio)}
                          {c.horarioFim && (
                            <>
                              <span aria-hidden="true">–</span>
                              {formatarHorario(c.horarioFim)}
                            </>
                          )}
                        </p>
                        {c.descricao && (
                          <p className="mt-1 text-xs text-muted-foreground">{c.descricao}</p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Aviso sobre cultos especiais */}
      <Card className="mt-8 border-dashed border-praise-gold/40 bg-praise-gold/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-praise-gold" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Cultos especiais e festividades</p>
            <p className="mt-1 text-muted-foreground">
              Além dos horários regulares acima, realizamos cultos especiais em datas comemorativas
              (Santa Ceia, conferências, campanhas, festividades). Esses eventos são divulgados
              individualmente na{" "}
              <Link href="/" className="text-primary hover:underline">página inicial</Link>{" "}
              e na{" "}
              <Link href="/eventos" className="text-primary hover:underline">página de eventos</Link>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Button asChild size="lg" className="praise-touch">
          <Link href="/baixar">
            <Church className="h-4 w-4" />
            Ver materiais dos cultos
          </Link>
        </Button>
      </div>
    </div>
  );
}
