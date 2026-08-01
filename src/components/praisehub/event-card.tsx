"use client";

import Link from "next/link";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/praisehub/status-badge";
import {
  diaDaSemana,
  formatarData,
  formatarHorario,
} from "@/lib/praise";
import type { EventDTO } from "@/types";

interface EventCardProps {
  evento: EventDTO;
  mostrarStatus?: boolean;
  mostrarAcoes?: boolean;
}

export function EventCard({ evento, mostrarStatus = false, mostrarAcoes = true }: EventCardProps) {
  const dataIso = evento.data;
  return (
    <Card className="praise-card flex flex-col overflow-hidden">
      {evento.capa ? (
         
        <img
          src={evento.capa}
          alt={`Capa do evento ${evento.nome}`}
          className="aspect-video w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary/10 to-praise-gold/10"
          aria-hidden="true"
        >
          <Calendar className="h-12 w-12 text-primary/40" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="praise-eyebrow">{evento.categoria?.nome ?? "Evento"}</p>
            <h3 className="mt-1 line-clamp-2 text-lg font-bold text-foreground">{evento.nome}</h3>
          </div>
          {mostrarStatus && <StatusBadge status={evento.status} />}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 pb-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="capitalize">{diaDaSemana(dataIso)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatarData(dataIso)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{formatarHorario(evento.horarioInicio)}</span>
          {evento.horarioFim && (
            <>
              <span aria-hidden="true">–</span>
              <span>{formatarHorario(evento.horarioFim)}</span>
            </>
          )}
        </div>
        {evento.local && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{evento.local}</span>
          </div>
        )}
        {evento.pregador && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{evento.pregador}</span>
          </div>
        )}
        {evento.tema && (
          <p className="pt-1 text-sm italic text-foreground/80">&ldquo;{evento.tema}&rdquo;</p>
        )}
      </CardContent>

      {mostrarAcoes && (
        <CardFooter className="border-t border-border bg-muted/30 px-4 py-3">
          <Button asChild size="sm" className="w-full praise-touch">
            <Link href={`/eventos/${evento.slug}`}>Ver detalhes</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
