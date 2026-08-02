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
  Upload,
  File as FileIcon,
  X,
  ImageIcon,
} from "lucide-react";
import type { EventCategoryDTO, MediaType } from "@/types";

interface EventFormWithUploadProps {
  categorias: EventCategoryDTO[];
}

const TIPOS_UPLOAD: { tipo: MediaType; label: string }[] = [
  { tipo: "whatsapp", label: "WhatsApp e Stories" },
  { tipo: "rede_social", label: "Redes sociais" },
  { tipo: "banner_telao", label: "Banner / Telão" },
  { tipo: "outros", label: "Outros arquivos" },
];

interface UploadItem {
  id: string;
  file: File;
  tipo: MediaType;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  previewUrl?: string;
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function EventFormWithUpload({ categorias }: EventFormWithUploadProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [eventoId, setEventoId] = useState<string | null>(null);
  const [eventoSlug, setEventoSlug] = useState<string>("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const [form, setForm] = useState({
    nome: "",
    categoriaId: "",
    descricao: "",
    data: "",
    horarioInicio: "19:30",
    horarioFim: "",
    local: "Templo ADSA Reimberg",
    endereco: "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP",
    tema: "",
    versiculo: "",
    pregador: "",
    ministerio: "",
    capa: "",
    status: "rascunho" as string,
    visibilidade: "publico" as string,
    destaqueManual: false,
    observacoesInternas: "",
  });

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const completude = [
    { label: "Nome do evento", ok: !!form.nome.trim() },
    { label: "Data", ok: !!form.data },
    { label: "Horário", ok: !!form.horarioInicio },
    { label: "Local", ok: !!form.local.trim() },
    { label: "Categoria", ok: !!form.categoriaId },
    { label: "Tema", ok: !!form.tema.trim() },
    { label: "Pregador", ok: !!form.pregador.trim() },
    { label: "Descrição", ok: !!form.descricao.trim() },
  ];
  const pct = Math.round((completude.filter((i) => i.ok).length / completude.length) * 100);

  // Criar evento (rascunho) para depois poder subir arquivos
  const criarRascunho = async (): Promise<string | null> => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do evento");
      return null;
    }
    if (!form.data) {
      toast.error("Informe a data do evento");
      return null;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "rascunho" }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao salvar");
        return null;
      }
      setEventoId(body.data.id);
      setEventoSlug(body.data.slug);
      toast.success("Rascunho criado! Agora você pode enviar materiais.");
      return body.data.id;
    } catch {
      toast.error("Erro de comunicação");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const publicarEvento = async () => {
    const id = eventoId ?? (await criarRascunho());
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "publicado" }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao publicar");
        return;
      }
      toast.success("Evento publicado!");
      router.push("/admin/eventos");
      router.refresh();
    } catch {
      toast.error("Erro de comunicação");
    } finally {
      setLoading(false);
    }
  };

  // Upload de arquivos
  const adicionarArquivos = (files: FileList | File[], tipo: MediaType) => {
    const novos: UploadItem[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      tipo,
      progress: 0,
      status: "pending" as const,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    }));
    setUploads((prev) => [...prev, ...novos]);
  };

  const removerUpload = (id: string) => {
    setUploads((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const enviarArquivos = async () => {
    if (!eventoId) {
      const id = await criarRascunho();
      if (!id) return;
    }

    const pendentes = uploads.filter((u) => u.status === "pending" || u.status === "error");
    if (pendentes.length === 0) {
      toast.info("Não há arquivos pendentes");
      return;
    }

    toast.info(`Enviando ${pendentes.length} arquivo(s)…`);

    for (const item of pendentes) {
      setUploads((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, status: "uploading", progress: 30 } : u)),
      );

      try {
        const formData = new FormData();
        const ext = item.file.name.split(".").pop() || "png";
        const nomeSimples = `arte-${Date.now()}.${ext}`;
        const arquivoRenomeado = new File([item.file], nomeSimples, {
          type: item.file.type || "image/png",
        });
        formData.append("file", arquivoRenomeado);
        formData.append("tipo", item.tipo);

        const res = await fetch(`/api/events/${eventoId}/upload`, {
          method: "POST",
          body: formData,
        });
        const body = await res.json();

        if (!res.ok || !body?.ok) {
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }

        setUploads((prev) =>
          prev.map((u) => (u.id === item.id ? { ...u, status: "done", progress: 100 } : u)),
        );
        toast.success(`${item.file.name} enviado!`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Falha no upload";
        setUploads((prev) =>
          prev.map((u) => (u.id === item.id ? { ...u, status: "error", error: msg } : u)),
        );
        toast.error(`Falha: ${msg}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de progresso */}
      <Card className="bg-secondary/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Progresso do cadastro</p>
              <p className="text-xs text-muted-foreground">
                {eventoId ? "✓ Rascunho salvo — pode enviar materiais" : "Preencha os dados para começar"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{pct}%</p>
            </div>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info" className="praise-touch">
            1. Informações do culto
          </TabsTrigger>
          <TabsTrigger value="materiais" className="praise-touch" disabled={!eventoId}>
            2. Materiais (upload)
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: Informações */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações básicas</CardTitle>
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
                    placeholder="Ex.: Pastoral, Louvor…"
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
                    className="praise-touch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={form.endereco}
                    onChange={(e) => set("endereco", e.target.value)}
                    className="praise-touch"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Texto e tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="pregador">Pregador / Responsável</Label>
                <Input
                  id="pregador"
                  value={form.pregador}
                  onChange={(e) => set("pregador", e.target.value)}
                  className="praise-touch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={form.descricao}
                  onChange={(e) => set("descricao", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publicação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Visibilidade</Label>
                  <Select value={form.visibilidade} onValueChange={(v) => set("visibilidade", v)}>
                    <SelectTrigger className="praise-touch">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">Público</SelectItem>
                      <SelectItem value="privado">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <div>
                  <Label htmlFor="destaque" className="font-medium">Destaque manual</Label>
                  <p className="text-xs text-muted-foreground">Forçar aparecer como "próximo culto"</p>
                </div>
                <Switch
                  id="destaque"
                  checked={form.destaqueManual}
                  onCheckedChange={(v) => set("destaqueManual", v)}
                />
              </div>
            </CardContent>
          </Card>

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
              onClick={criarRascunho}
              disabled={loading}
              className="praise-touch"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {eventoId ? "Salvar alterações" : "Salvar e habilitar upload"}
            </Button>
            <Button
              onClick={publicarEvento}
              disabled={loading}
              className="ml-auto praise-touch"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publicar evento
            </Button>
          </div>
        </TabsContent>

        {/* ABA 2: Materiais */}
        <TabsContent value="materiais" className="space-y-4">
          {!eventoId ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                <p className="text-lg font-semibold">Salve o rascunho primeiro</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Volte para a aba "Informações" e clique em "Salvar e habilitar upload".
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {TIPOS_UPLOAD.map(({ tipo, label }) => (
                <Card key={tipo}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Upload className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <UploadZone
                      tipo={tipo}
                      onFiles={(files) => adicionarArquivos(files, tipo)}
                    />
                    {uploads.filter((u) => u.tipo === tipo).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-md border border-border bg-card p-2"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.previewUrl ? (
                            <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <FileIcon className="h-5 w-5 m-auto mt-2.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{item.file.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatarTamanho(item.file.size)}
                            {item.status === "done" && " · ✓ enviado"}
                            {item.status === "error" && ` · ✗ ${item.error}`}
                            {item.status === "uploading" && " · enviando…"}
                          </p>
                        </div>
                        {item.status === "done" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : item.status === "uploading" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removerUpload(item.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {uploads.filter((u) => u.status === "pending" || u.status === "error").length > 0 && (
                <Button onClick={enviarArquivos} disabled={loading} className="w-full praise-touch">
                  <Upload className="h-4 w-4" />
                  Enviar {uploads.filter((u) => u.status === "pending" || u.status === "error").length} arquivo(s)
                </Button>
              )}

              <Button onClick={publicarEvento} disabled={loading} className="w-full praise-touch" size="lg">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Publicar evento com materiais
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente de zona de upload
function UploadZone({
  tipo,
  onFiles,
}: {
  tipo: MediaType;
  onFiles: (files: FileList) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
      }}
      onClick={() => ref.current?.click()}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
      }`}
    >
      <input
        ref={ref}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-xs font-medium">Clique ou arraste arquivos</p>
    </div>
  );
}

import { useRef } from "react";
