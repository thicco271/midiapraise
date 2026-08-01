"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Church, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/praisehub/auth-provider";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Informe e-mail e senha");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha no login");
        return;
      }
      toast.success(`Bem-vindo(a), ${body.data.nome.split(" ")[0]}!`);
      await refresh();
      router.push(callbackUrl);
    } catch {
      toast.error("Falha na comunicação com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@adsapraise.org"
            className="pl-10 praise-touch"
            disabled={loading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className="pl-10 praise-touch"
            disabled={loading}
          />
        </div>
      </div>
      <Button type="submit" className="w-full praise-touch" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="praise-container flex min-h-[calc(100vh-12rem)] items-center justify-center py-10">
      <Card className="w-full max-w-md praise-card">
        <CardHeader className="space-y-3 text-center">
          <img
            src="/logo-adsa-azul.png"
            alt=""
            width={56}
            height={56}
            className="mx-auto h-14 w-14 object-contain"
            aria-hidden="true"
          />
          <CardTitle className="text-2xl">Entrar na ADSA Reimberg Mídias</CardTitle>
          <p className="text-sm text-muted-foreground">
            Acesso restrito à equipe de mídia da ADSA Reimberg.
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-32 animate-pulse rounded-md bg-muted/40" />}>
            <LoginForm />
          </Suspense>

          <div className="mt-4 rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Acesso inicial:</p>
            <p className="mt-1">E-mail: <code className="rounded bg-background px-1 py-0.5">admin@adsapraise.org</code></p>
            <p>Senha: <code className="rounded bg-background px-1 py-0.5">praisehub2026</code></p>
            <p className="mt-1 italic">Altere a senha após o primeiro acesso assim que o módulo estiver disponível.</p>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">← Voltar para a página inicial</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
