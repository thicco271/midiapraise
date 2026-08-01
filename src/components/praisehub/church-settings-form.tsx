"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import type { ChurchSettingsDTO } from "@/types";

interface Props {
  initial: ChurchSettingsDTO;
}

export function ChurchSettingsForm({ initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initial);
  const set = (k: keyof ChurchSettingsDTO, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/church-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao salvar configurações");
        return;
      }
      toast.success("Configurações atualizadas!");
      router.refresh();
    } catch {
      toast.error("Erro de comunicação com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identidade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nomeDaIgreja">Nome da igreja</Label>
            <Input
              id="nomeDaIgreja"
              value={form.nomeDaIgreja}
              onChange={(e) => set("nomeDaIgreja", e.target.value)}
              className="praise-touch"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomeDaAplicacao">Nome da aplicação</Label>
            <Input
              id="nomeDaAplicacao"
              value={form.nomeDaAplicacao}
              onChange={(e) => set("nomeDaAplicacao", e.target.value)}
              className="praise-touch"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="subtitulo">Subtítulo</Label>
            <Input
              id="subtitulo"
              value={form.subtitulo}
              onChange={(e) => set("subtitulo", e.target.value)}
              className="praise-touch"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="corPrimaria">Cor primária</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.corPrimaria}
                onChange={(e) => set("corPrimaria", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-input"
                aria-label="Cor primária"
              />
              <Input
                id="corPrimaria"
                value={form.corPrimaria}
                onChange={(e) => set("corPrimaria", e.target.value)}
                className="praise-touch"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="corDestaque">Cor de destaque</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.corDestaque}
                onChange={(e) => set("corDestaque", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-input"
                aria-label="Cor de destaque"
              />
              <Input
                id="corDestaque"
                value={form.corDestaque}
                onChange={(e) => set("corDestaque", e.target.value)}
                className="praise-touch"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Textos institucionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textoPrincipal">Texto principal (página inicial)</Label>
            <Textarea
              id="textoPrincipal"
              value={form.textoPrincipal}
              onChange={(e) => set("textoPrincipal", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="textoComplementar">Texto complementar</Label>
            <Textarea
              id="textoComplementar"
              value={form.textoComplementar}
              onChange={(e) => set("textoComplementar", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Localização</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={form.endereco ?? ""}
              onChange={(e) => set("endereco", e.target.value)}
              className="praise-touch"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fusoHorario">Fuso horário</Label>
            <Input
              id="fusoHorario"
              value={form.fusoHorario}
              onChange={(e) => set("fusoHorario", e.target.value)}
              className="praise-touch"
            />
            <p className="text-xs text-muted-foreground">Padrão: America/Sao_Paulo</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identidade visual (URLs)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">URL do logo</Label>
            <Input
              id="logo"
              value={form.logo ?? ""}
              onChange={(e) => set("logo", e.target.value)}
              placeholder="https://…"
              className="praise-touch"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icone">URL do ícone</Label>
            <Input
              id="icone"
              value={form.icone ?? ""}
              onChange={(e) => set("icone", e.target.value)}
              placeholder="https://…"
              className="praise-touch"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imagemDeCapa">URL da imagem de capa</Label>
            <Input
              id="imagemDeCapa"
              value={form.imagemDeCapa ?? ""}
              onChange={(e) => set("imagemDeCapa", e.target.value)}
              placeholder="https://…"
              className="praise-touch"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            O upload real de logos e ícones será entregue em uma fase posterior. Por enquanto, informe as URLs.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="praise-touch">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar configurações
        </Button>
      </div>
    </form>
  );
}
