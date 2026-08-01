"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Send } from "lucide-react";

interface EventoOpcao {
  id: string;
  nome: string;
  data: string;
}

interface AlbumFormProps {
  eventos: EventoOpcao[];
  albumExistente?: any;
}

export function AlbumForm({ eventos, albumExistente }: AlbumFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: albumExistente?.nome ?? "",
    eventoId: albumExistente?.eventoId ?? "",
    descricao: albumExistente?.descricao ?? "",
    fotografo: albumExistente?.fotografo ?? "",
    visibilidade: albumExistente?.visibilidade ?? "publico",
    permitirDownload: albumExistente?.permitirDownload ?? true,
    aceitarContribuicoes: albumExistente?.aceitarContribuicoes ?? false,
    status: albumExistente?.status ?? "rascunho",
  });

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (statusFinal?: string) => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do álbum");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (statusFinal) payload.status = statusFinal;

      const isEdit = !!albumExistente?.id;
      const url = isEdit ? `/api/albums/${albumExistente.id}` : "/api/albums";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao salvar álbum");
        return;
      }
      toast.success(statusFinal === "publicado" ? "Álbum publicado!" : "Álbum salvo!");
      router.push(`/admin/galeria/${body.data.id}`);
      router.refresh();
    } catch {
      toast.error("Erro de comunicação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Informações do álbum</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do álbum *</Label>
          <Input
            id="nome"
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
            placeholder="Ex.: Culto da Família — 09/08/2026"
            className="praise-touch"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="evento">Evento vinculado (opcional)</Label>
            <Select
              value={form.eventoId || "_nenhum"}
              onValueChange={(v) => set("eventoId", v === "_nenhum" ? "" : v)}
            >
              <SelectTrigger id="evento" className="praise-touch">
                <SelectValue placeholder="Sem evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_nenhum">Sem evento vinculado</SelectItem>
                {eventos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome} ({new Date(e.data).toLocaleDateString("pt-BR")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fotografo">Fotógrafo (opcional)</Label>
            <Input
              id="fotografo"
              value={form.fotografo}
              onChange={(e) => set("fotografo", e.target.value)}
              placeholder="Ex.: João Silva"
              className="praise-touch"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição (opcional)</Label>
          <Textarea
            id="descricao"
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Resumo do que foi registrado no álbum…"
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="visibilidade">Visibilidade</Label>
            <Select
              value={form.visibilidade}
              onValueChange={(v) => set("visibilidade", v)}
            >
              <SelectTrigger id="visibilidade" className="praise-touch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publico">Público</SelectItem>
                <SelectItem value="somente_equipe">Somente equipe de mídia</SelectItem>
                <SelectItem value="somente_autenticados">Somente autenticados</SelectItem>
                <SelectItem value="privado">Privado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v)}
            >
              <SelectTrigger id="status" className="praise-touch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Label htmlFor="permitirDownload" className="font-medium">Permitir download das fotos</Label>
              <p className="text-xs text-muted-foreground">
                Visitantes podem baixar fotos individualmente.
              </p>
            </div>
            <Switch
              id="permitirDownload"
              checked={form.permitirDownload}
              onCheckedChange={(v) => set("permitirDownload", v)}
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <div>
              <Label htmlFor="aceitarContribuicoes" className="font-medium">Aceitar contribuições</Label>
              <p className="text-xs text-muted-foreground">
                Gera link público para receber fotos (Fase 5).
              </p>
            </div>
            <Switch
              id="aceitarContribuicoes"
              checked={form.aceitarContribuicoes}
              onCheckedChange={(v) => set("aceitarContribuicoes", v)}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild variant="ghost" className="praise-touch">
            <Link href="/admin/galeria">
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit("rascunho")}
            disabled={loading}
            className="praise-touch"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar rascunho
          </Button>
          <Button
            onClick={() => handleSubmit("publicado")}
            disabled={loading}
            className="ml-auto praise-touch"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publicar álbum
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
