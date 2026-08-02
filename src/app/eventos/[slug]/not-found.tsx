// Página 404 customizada para /eventos/[slug]
// Mostra mensagem amigável + link para lista de eventos
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarX, ChevronLeft } from "lucide-react";

export default function EventoNotFound() {
  return (
    <div className="praise-container flex min-h-[60vh] items-center justify-center py-10">
      <Card className="max-w-md border-dashed">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CalendarX className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-foreground">
            Culto não encontrado
          </h1>
          <p className="text-sm text-muted-foreground">
            Este culto pode ter sido removido, renomeado ou ainda não foi publicado.
            Verifique a lista de eventos disponíveis.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild variant="default" className="praise-touch">
              <Link href="/eventos">
                <CalendarX className="h-4 w-4" />
                Ver todos os cultos
              </Link>
            </Button>
            <Button asChild variant="outline" className="praise-touch">
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
                Voltar para o início
              </Link>
            </Button>
          </div>
          <p className="pt-4 text-xs text-muted-foreground">
            Se você é administrador, acesse{" "}
            <Link href="/admin/eventos" className="text-primary hover:underline">
              /admin/eventos
            </Link>{" "}
            para gerenciar eventos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
