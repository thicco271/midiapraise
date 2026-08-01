"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Save, Trash2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface CultoDTO {
  id: string;
  nome: string;
  diaSemana: number;
  horarioInicio: string;
  horarioFim: string;
  categoria: string;
  descricao: string;
  ativo: boolean;
  ordem: number;
}

const DIAS = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
];

const CATEGORIAS = [
  { value: "culto", label: "Culto" },
  { value: "ebd", label: "EBD (Escola Bíblica)" },
  { value: "especial", label: "Especial" },
  { value: "outro", label: "Outro" },
];

interface CultosManagerProps {
  cultosIniciais: CultoDTO[];
}

export function CultosManager({ cultosIniciais }: CultosManagerProps) {
  const router = useRouter();
  const [cultos, setCultos] = useState<CultoDTO[]>(cultosIniciais);
  const [salvando, setSalvando] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [excluindo, setExcluindo] = useState<CultoDTO | null>(null);
  const [excluindoLoading, setExcluindoLoading] = useState(false);

  // Novo culto
  const [novo, setNovo] = useState({
    nome: "",
    diaSemana: "0",
    horarioInicio: "19:30",
    horarioFim: "",
    categoria: "culto",
    descricao: "",
  });

  const adicionarCulto = async () => {
    if (!novo.nome.trim()) {
      toast.error("Informe o nome do culto");
      return;
    }
    setAdicionando(true);
    try {
      const res = await fetch("/api/cultos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novo,
          diaSemana: Number(novo.diaSemana),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao adicionar");
        return;
      }
      toast.success("Culto adicionado!");
      setNovo({
        nome: "",
        diaSemana: "0",
        horarioInicio: "19:30",
        horarioFim: "",
        categoria: "culto",
        descricao: "",
      });
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    } finally {
      setAdicionando(false);
    }
  };

  const atualizarCampo = (id: string, campo: keyof CultoDTO, valor: any) => {
    setCultos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)),
    );
  };

  const salvarTudo = async () => {
    setSalvando(true);
    try {
      const res = await fetch("/api/cultos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cultos }),
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao salvar");
        return;
      }
      toast.success("Horários salvos!");
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!excluindo) return;
    setExcluindoLoading(true);
    try {
      const res = await fetch(`/api/cultos/${excluindo.id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Falha ao excluir");
        return;
      }
      toast.success("Culto excluído");
      setExcluindo(null);
      router.refresh();
    } catch {
      toast.error("Falha na comunicação");
    } finally {
      setExcluindoLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Lista de cultos editáveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                Cultos cadastrados ({cultos.length})
              </span>
              <Button onClick={salvarTudo} disabled={salvando} size="sm">
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar tudo
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cultos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum culto cadastrado. Adicione abaixo.
              </p>
            ) : (
              cultos.map((c) => (
                <div
                  key={c.id}
                  className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[1fr_140px_100px_100px_120px_40px]"
                >
                  {/* Nome + descrição */}
                  <div className="space-y-1.5">
                    <Input
                      value={c.nome}
                      onChange={(e) => atualizarCampo(c.id, "nome", e.target.value)}
                      placeholder="Nome do culto"
                      className="praise-touch h-9"
                    />
                    <Textarea
                      value={c.descricao}
                      onChange={(e) => atualizarCampo(c.id, "descricao", e.target.value)}
                      placeholder="Descrição (opcional)"
                      rows={1}
                      className="text-xs"
                    />
                  </div>

                  {/* Dia */}
                  <Select
                    value={String(c.diaSemana)}
                    onValueChange={(v) => atualizarCampo(c.id, "diaSemana", Number(v))}
                  >
                    <SelectTrigger className="praise-touch h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Início */}
                  <Input
                    type="time"
                    value={c.horarioInicio}
                    onChange={(e) => atualizarCampo(c.id, "horarioInicio", e.target.value)}
                    className="praise-touch h-9"
                  />

                  {/* Fim */}
                  <Input
                    type="time"
                    value={c.horarioFim}
                    onChange={(e) => atualizarCampo(c.id, "horarioFim", e.target.value)}
                    className="praise-touch h-9"
                  />

                  {/* Categoria + ativo */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={c.categoria || "outro"}
                      onValueChange={(v) => atualizarCampo(c.id, "categoria", v)}
                    >
                      <SelectTrigger className="praise-touch h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={c.ativo}
                      onCheckedChange={(v) => atualizarCampo(c.id, "ativo", v)}
                      aria-label="Ativo"
                    />
                  </div>

                  {/* Excluir */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    onClick={() => setExcluindo(c)}
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Adicionar novo culto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-praise-gold" aria-hidden="true" />
              Adicionar culto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="novo-nome">Nome</Label>
                <Input
                  id="novo-nome"
                  value={novo.nome}
                  onChange={(e) => setNovo((n) => ({ ...n, nome: e.target.value }))}
                  placeholder="Ex.: Quinta de Avivamento"
                  className="praise-touch"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="novo-dia">Dia da semana</Label>
                <Select value={novo.diaSemana} onValueChange={(v) => setNovo((n) => ({ ...n, diaSemana: v }))}>
                  <SelectTrigger id="novo-dia" className="praise-touch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="novo-inicio">Início</Label>
                <Input
                  id="novo-inicio"
                  type="time"
                  value={novo.horarioInicio}
                  onChange={(e) => setNovo((n) => ({ ...n, horarioInicio: e.target.value }))}
                  className="praise-touch"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="novo-fim">Término (opcional)</Label>
                <Input
                  id="novo-fim"
                  type="time"
                  value={novo.horarioFim}
                  onChange={(e) => setNovo((n) => ({ ...n, horarioFim: e.target.value }))}
                  className="praise-touch"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="novo-cat">Categoria</Label>
                <Select value={novo.categoria} onValueChange={(v) => setNovo((n) => ({ ...n, categoria: v }))}>
                  <SelectTrigger id="novo-cat" className="praise-touch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="novo-desc">Descrição (opcional)</Label>
              <Textarea
                id="novo-desc"
                value={novo.descricao}
                onChange={(e) => setNovo((n) => ({ ...n, descricao: e.target.value }))}
                placeholder="Ex.: Culto de avivamento e oração"
                rows={2}
              />
            </div>
            <Button onClick={adicionarCulto} disabled={adicionando} className="praise-touch">
              {adicionando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adicionando…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Adicionar culto
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmação exclusão */}
      <AlertDialog open={!!excluindo} onOpenChange={(open) => !open && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir culto?</AlertDialogTitle>
            <AlertDialogDescription>
              O culto <strong>{excluindo?.nome}</strong> será removido permanentemente da agenda pública.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindoLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              disabled={excluindoLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {excluindoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Sim, excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
