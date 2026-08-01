"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  Sparkles,
  CheckCircle2,
  Eye,
} from "lucide-react";
import type { EventCategoryDTO, EventStatus, Visibilidade } from "@/types";

interface EventFormProps {
  categorias: EventCategoryDTO[];
  eventoExistente?: any;
}

const STATUS_OPCOES: { value: EventStatus; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "em_producao", label: "Em produção" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { value: "aprovado", label: "Aprovado" },
  { value: "programado", label: "Programado" },
  { value: "publicado", label: "Publicado" },
  { value: "encerrado", label: "Encerrado" },
];

const VISIBILIDADE_OPCOES: { value: Visibilidade; label: string }[] = [
  { value: "publico", label: "Público" },
  { value: "somente_equipe", label: "Somente equipe de mídia" },
  { value: "somente_autenticados", label: "Somente usuários autenticados" },
  { value: "privado", label: "Privado" },
];

function calcularCompletude(form: any): { pct: number; itens: { label: string; ok: boolean }[] } {
  const itens = [
    { label: "Nome do evento", ok: !!form.nome?.trim() },
    { label: "Data", ok: !!form.data },
    { label: "Horário", ok: !!form.horarioInicio },
    { label: "Local", ok: !!form.local?.trim() },
    { label: "Categoria", ok: !!form.categoriaId },
    { label: "Tema", ok: !!form.tema?.trim() },
    { label: "Pregador", ok: !!form.pregador?.trim() },
    { label: "Descrição", ok: !!form.descricao?.trim() },
    { label: "Capa (URL)", ok: !!form.capa?.trim() },
  ];
  const ok = itens.filter((i) => i.ok).length;
  return { pct: Math.round((ok / itens.length) * 100), itens };
}

export function EventForm({ categorias, eventoExistente }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: eventoExistente?.nome ?? "",
    categoriaId: eventoExistente?.categoriaId ?? "",
    descricao: eventoExistente?.descricao ?? "",
    data: eventoExistente?.data
      ? new Date(eventoExistente.data).toISOString().slice(0, 10)
      : "",
    horarioInicio: eventoExistente?.horarioInicio ?? "19:30",
    horarioFim: eventoExistente?.horarioFim ?? "",
    local: eventoExistente?.local ?? "",
    endereco: eventoExistente?.endereco ?? "",
    tema: eventoExistente?.tema ?? "",
    versiculo: eventoExistente?.versiculo ?? "",
    pregador: eventoExistente?.pregador ?? "",
    ministerio: eventoExistente?.ministerio ?? "",
    capa: eventoExistente?.capa ?? "",
    status: (eventoExistente?.status ?? "rascunho") as EventStatus,
    visibilidade: (eventoExistente?.visibilidade ?? "publico") as Visibilidade,
    destaqueManual: eventoExistente?.destaqueManual ?? false,
    observacoesInternas: eventoExistente?.observacoesInternas ?? "",
  });

  const completo = calcularCompletude(form);
  const isEdit = !!eventoExistente?.id;

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (statusFinal?: EventStatus) => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do evento");
      return;
    }
    if (!form.data) {
      toast.error("Informe a data do evento");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (statusFinal) payload.status = statusFinal;

      const url = isEdit
        ? `/api/events/${eventoExistente.id}`
        : "/api/events";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao salvar evento");
        return;
      }
      toast.success(
        statusFinal === "publicado"
          ? "Evento publicado!"
          : statusFinal === "rascunho"
          ? "Rascunho salvo"
          : "Evento salvo",
      );
      router.push("/admin/eventos");
      router.refresh();
    } catch {
      toast.error("Erro de comunicação com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="praise-touch">Informações</TabsTrigger>
            <TabsTrigger value="arte" className="praise-touch">Arte</TabsTrigger>
            <TabsTrigger value="texto" className="praise-touch">Textos</TabsTrigger>
            <TabsTrigger value="revisao" className="praise-touch">Revisão</TabsTrigger>
          </TabsList>

          {/* Etapa 1: Informações */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Etapa 1 — Informações do culto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do evento *</Label>
                  <Input
                    id="nome"
                    value={form.nome}
                    onChange={(e) => set("nome", e.target.value)}
                    placeholder="Ex.: Culto da Família"
                    className="praise-touch"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={form.categoriaId} onValueChange={(v) => set("categoriaId", v)}>
                      <SelectTrigger id="categoria" className="praise-touch">
                        <SelectValue placeholder="Selecione…" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ministerio">Ministério</Label>
                    <Input
                      id="ministerio"
                      value={form.ministerio}
                      onChange={(e) => set("ministerio", e.target.value)}
                      placeholder="Ex.: Pastoral, Louvor, Jovens…"
                      className="praise-touch"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={form.data}
                      onChange={(e) => set("data", e.target.value)}
                      className="praise-touch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horarioInicio">Início *</Label>
                    <Input
                      id="horarioInicio"
                      type="time"
                      value={form.horarioInicio}
                      onChange={(e) => set("horarioInicio", e.target.value)}
                      className="praise-touch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horarioFim">Término</Label>
                    <Input
                      id="horarioFim"
                      type="time"
                      value={form.horarioFim}
                      onChange={(e) => set("horarioFim", e.target.value)}
                      className="praise-touch"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      value={form.local}
                      onChange={(e) => set("local", e.target.value)}
                      placeholder="Ex.: Templo ADSA Reimberg"
                      className="praise-touch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={form.endereco}
                      onChange={(e) => set("endereco", e.target.value)}
                      placeholder="Ex.: Av. Exemplo, 1000"
                      className="praise-touch"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Etapa 2: Arte */}
          <TabsContent value="arte" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Etapa 2 — Capa e identidade visual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capa">URL da imagem de capa</Label>
                  <Input
                    id="capa"
                    value={form.capa}
                    onChange={(e) => set("capa", e.target.value)}
                    placeholder="https://… (upload de arquivos será entregue na Fase 3)"
                    className="praise-touch"
                  />
                  <p className="text-xs text-muted-foreground">
                    Por enquanto, informe a URL de uma imagem hospedada. O upload real de arquivos
                    será entregue na <strong>Fase 3 (Central de Artes)</strong>.
                  </p>
                </div>
                {form.capa && (
                  <div className="overflow-hidden rounded-lg border border-border">
                    { }
                    <img
                      src={form.capa}
                      alt="Pré-visualização da capa"
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Etapa 3: Textos */}
          <TabsContent value="texto" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Etapa 3 — Textos e tema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tema">Tema</Label>
                  <Input
                    id="tema"
                    value={form.tema}
                    onChange={(e) => set("tema", e.target.value)}
                    placeholder="Ex.: Famílias que adoram juntos"
                    className="praise-touch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="versiculo">Versículo</Label>
                  <Input
                    id="versiculo"
                    value={form.versiculo}
                    onChange={(e) => set("versiculo", e.target.value)}
                    placeholder="Ex.: Salmo 133:1"
                    className="praise-touch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pregador">Pregador / Responsável</Label>
                  <Input
                    id="pregador"
                    value={form.pregador}
                    onChange={(e) => set("pregador", e.target.value)}
                    placeholder="Ex.: Pr. João da Silva"
                    className="praise-touch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={form.descricao}
                    onChange={(e) => set("descricao", e.target.value)}
                    placeholder="Descrição exibida na página pública do evento…"
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoesInternas">Observações internas</Label>
                  <Textarea
                    id="observacoesInternas"
                    value={form.observacoesInternas}
                    onChange={(e) => set("observacoesInternas", e.target.value)}
                    placeholder="Anotações internas (não exibidas publicamente)…"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Etapa 4: Revisão */}
          <TabsContent value="revisao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Etapa 4 — Revisão e publicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={form.status} onValueChange={(v) => set("status", v as EventStatus)}>
                      <SelectTrigger id="status" className="praise-touch">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPCOES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibilidade">Visibilidade</Label>
                    <Select value={form.visibilidade} onValueChange={(v) => set("visibilidade", v as Visibilidade)}>
                      <SelectTrigger id="visibilidade" className="praise-touch">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIBILIDADE_OPCOES.map((v) => (
                          <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <div>
                    <Label htmlFor="destaque" className="font-medium">Destaque manual</Label>
                    <p className="text-xs text-muted-foreground">
                      Se ativo, este evento aparece como "próximo culto" na página inicial (mesmo se houver outro mais próximo).
                    </p>
                  </div>
                  <Switch
                    id="destaque"
                    checked={form.destaqueManual}
                    onCheckedChange={(v) => set("destaqueManual", v)}
                    aria-label="Ativar destaque manual"
                  />
                </div>

                <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                  <p className="font-medium">Resumo:</p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>Nome: <strong className="text-foreground">{form.nome || "—"}</strong></li>
                    <li>Data: <strong className="text-foreground">{form.data || "—"}</strong> às <strong className="text-foreground">{form.horarioInicio}</strong></li>
                    <li>Local: <strong className="text-foreground">{form.local || "—"}</strong></li>
                    <li>Status: <strong className="text-foreground">{form.status}</strong></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="ghost" className="praise-touch">
            <Link href="/admin/eventos">
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
            className="praise-touch ml-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publicar evento
          </Button>
        </div>
      </div>

      {/* Sidebar: completude */}
      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-praise-gold" aria-hidden="true" />
              Completude
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completo.pct}%` }}
                aria-label={`Progresso ${completo.pct}%`}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {completo.pct}% completo
            </p>
            <ul className="space-y-1 text-xs">
              {completo.itens.map((i) => (
                <li key={i.label} className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${i.ok ? "text-emerald-600" : "text-muted-foreground/50"}`}
                    aria-hidden="true"
                  />
                  <span className={i.ok ? "text-foreground" : "text-muted-foreground"}>{i.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {isEdit && eventoExistente?.slug && (
          <Card className="bg-secondary/40">
            <CardContent className="space-y-2 p-4 text-sm">
              <p className="font-medium">Página pública</p>
              <p className="text-xs text-muted-foreground">
                Veja como o evento aparece para o público.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full praise-touch">
                <a href={`/eventos/${eventoExistente.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                  Visualizar
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}
