"use client";

import Link from "next/link";
import { useAuth } from "@/components/praisehub/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, BookOpen } from "lucide-react";

export function DashboardClient() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Card className="mt-6 bg-secondary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-praise-gold" aria-hidden="true" />
          Olá, {user.nome.split(" ")[0]}!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Você está conectado como <strong className="text-foreground">{user.perfil}</strong>. Esta é a entrega
          das Fases 1 e 2 do PraiseHub (Fundação + Eventos).
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/eventos/novo">
              <FileText className="h-4 w-4" />
              Criar culto
            </Link>
          </Button>
          {user.perfil === "administrador" && (
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/configuracoes">
                <BookOpen className="h-4 w-4" />
                Configurações
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
