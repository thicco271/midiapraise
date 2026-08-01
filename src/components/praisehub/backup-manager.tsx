"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Download,
  Upload,
  Loader2,
  Database,
  HardDrive,
  History,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { formatarData } from "@/lib/praise";

interface HistoricoItem {
  id: string;
  acao: string;
  descricao: string;
  criadoEm: string;
  usuario: { nome: string } | null;
}

interface BackupManagerProps {
  historico: HistoricoItem[];
}

export function BackupManager({ historico }: BackupManagerProps) {
  const [baixando, setBaixando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [confirmandoRestore, setConfirmandoRestore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baixarBackup = async () => {
    setBaixando(true);
    try {
      const res = await fetch("/api/admin/backup", { method: "GET" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const now = new Date();
      const ts = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.download = `backup-reimberg-${ts}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup baixado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao baixar backup");
    } finally {
      setBaixando(false);
    }
  };

  const selecionarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.name.toLowerCase().endsWith(".zip")) {
        toast.error("Selecione um arquivo .zip");
        return;
      }
      setArquivoSelecionado(f);
      setConfirmandoRestore(true);
    }
    e.target.value = "";
  };

  const confirmarRestore = async () => {
    if (!arquivoSelecionado) return;
    setRestaurando(true);
    try {
      const formData = new FormData();
      formData.append("file", arquivoSelecionado);

      const res = await fetch("/api/admin/restore", {
        method: "POST",
        body: formData,
      });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      toast.success(body.data?.mensagem ?? "Backup restaurado!");
      setArquivoSelecionado(null);
      setConfirmandoRestore(false);
      // Recarrega a página após 2s para refletir os dados restaurados
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao restaurar");
      setArquivoSelecionado(null);
      setConfirmandoRestore(false);
    } finally {
      setRestaurando(false);
    }
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Baixar backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4 text-praise-gold" aria-hidden="true" />
              Baixar backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
              <p className="flex items-center gap-2">
                <Database className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                <span className="font-medium">Banco de dados</span>
                <span className="text-muted-foreground">SQLite completo</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Todos os eventos, mídias, álbuns, usuários, auditoria, configurações.
              </p>
              <p className="flex items-center gap-2 pt-1">
                <HardDrive className="h-4 w-4 text-praise-gold" aria-hidden="true" />
                <span className="font-medium">Arquivos físicos</span>
                <span className="text-muted-foreground">Pasta uploads/</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Todas as artes, fotos, thumbnails e versões anteriores.
              </p>
            </div>
            <Button
              onClick={baixarBackup}
              disabled={baixando}
              size="lg"
              className="w-full praise-touch"
            >
              {baixando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando backup…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Baixar backup completo (.zip)
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              O download inicia automaticamente. O arquivo contém tudo necessário para restaurar
              a aplicação em qualquer servidor.
            </p>
          </CardContent>
        </Card>

        {/* Restaurar backup */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restaurar backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <p className="flex items-start gap-2 font-medium text-destructive">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Atenção: ação irreversível</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Restaurar um backup <strong>substitui completamente</strong> o banco de dados
                atual e todos os arquivos de uploads pelos do backup selecionado.
              </p>
              <p className="text-xs text-muted-foreground">
                Recomendamos <strong>baixar um backup do estado atual</strong> antes de restaurar,
                caso precise voltar.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={selecionarArquivo}
              className="sr-only"
              aria-label="Selecionar arquivo de backup"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={restaurando}
              variant="outline"
              size="lg"
              className="w-full praise-touch border-destructive/40 text-destructive hover:bg-destructive/5"
            >
              {restaurando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restaurando…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Selecionar arquivo .zip para restaurar
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Selecione um arquivo .zip gerado por este sistema. O sistema valida o manifesto
              antes de aplicar.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-praise-gold" aria-hidden="true" />
            Histórico de operações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma operação de backup registrada ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {historico.map((h) => (
                <li key={h.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 shrink-0">
                    {h.acao === "criar" ? (
                      <Download className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    ) : h.acao === "restaurar" ? (
                      <RotateCcw className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{h.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatarData(h.criadoEm, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      {h.usuario && ` · por ${h.usuario.nome}`}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`border-0 ${
                      h.acao === "criar"
                        ? "bg-emerald-100 text-emerald-700"
                        : h.acao === "restaurar"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {h.acao}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Confirmação restore */}
      <AlertDialog open={confirmandoRestore} onOpenChange={(open) => {
        if (!open) {
          setArquivoSelecionado(null);
          setConfirmandoRestore(false);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar restauração?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Você está prestes a restaurar o backup: <strong>{arquivoSelecionado?.name}</strong>
                  ({arquivoSelecionado ? (arquivoSelecionado.size / 1024 / 1024).toFixed(1) : 0} MB)
                </p>
                <p className="text-destructive">
                  ⚠️ Todos os dados atuais (eventos, mídias, álbuns, fotos, configurações) serão
                  <strong> substituídos</strong> pelos dados do backup.
                </p>
                <p className="text-xs">
                  O sistema cria um backup automático do estado atual antes de restaurar (para
                  rollback em caso de falha). Após a restauração, recomenda-se reiniciar o servidor.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restaurando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarRestore}
              disabled={restaurando}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {restaurando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restaurando…
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Sim, restaurar backup
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
