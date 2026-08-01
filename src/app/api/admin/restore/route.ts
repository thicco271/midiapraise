// POST /api/admin/restore - restaura backup de um ZIP
// Recebe multipart com campo "file" (zip)
// Substitui DB + uploads
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import AdmZip from "adm-zip";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.perfil !== "administrador") {
    return NextResponse.json({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Falha ao ler multipart" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Arquivo não recebido" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".zip")) {
    return NextResponse.json({ ok: false, error: "Arquivo deve ser .zip" }, { status: 400 });
  }

  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);

  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    return NextResponse.json({ ok: false, error: "ZIP inválido ou corrompido" }, { status: 400 });
  }

  // Validar manifest
  const manifestEntry = zip.getEntries().find((e: any) => e.entryName === "manifest.json");
  if (!manifestEntry) {
    return NextResponse.json({ ok: false, error: "manifest.json não encontrado no ZIP — backup inválido" }, { status: 400 });
  }

  let manifest: any;
  try {
    manifest = JSON.parse(manifestEntry.getData().toString("utf8"));
  } catch {
    return NextResponse.json({ ok: false, error: "manifest.json corrompido" }, { status: 400 });
  }

  if (manifest.aplicacao !== "ADSA Reimberg Mídias") {
    return NextResponse.json({ ok: false, error: "Backup não pertence a esta aplicação" }, { status: 400 });
  }

  // Backup do estado atual (antes de sobrescrever) — para rollback em caso de falha
  const dbPath = path.join(process.cwd(), "db", "custom.db");
  const dbBackupPath = path.join(process.cwd(), "db", `custom.db.pre-restore-${Date.now()}`);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const uploadsBackupDir = path.join(process.cwd(), "public", `uploads-pre-restore-${Date.now()}`);

  try {
    // Backup do DB atual
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, dbBackupPath);
    }

    // Renomear uploads atuais (se existirem)
    if (fs.existsSync(uploadsDir)) {
      fs.renameSync(uploadsDir, uploadsBackupDir);
    }

    // Extrair DB do ZIP
    const dbEntry = zip.getEntries().find((e: any) => e.entryName === "database/custom.db");
    if (!dbEntry) {
      throw new Error("database/custom.db não encontrado no ZIP");
    }
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, dbEntry.getData());

    // Extrair uploads do ZIP
    fs.mkdirSync(uploadsDir, { recursive: true });
    const uploadEntries = zip.getEntries().filter((e: any) =>
      e.entryName.startsWith("uploads/") && !e.isDirectory,
    );
    for (const entry of uploadEntries) {
      const relPath = entry.entryName.replace(/^uploads\//, "");
      const targetPath = path.join(uploadsDir, relPath);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, entry.getData());
    }

    // Apagar backups temporários (sucesso)
    if (fs.existsSync(dbBackupPath)) fs.unlinkSync(dbBackupPath);
    if (fs.existsSync(uploadsBackupDir)) {
      fs.rmSync(uploadsBackupDir, { recursive: true, force: true });
    }

    // Auditoria
    await db.auditLog.create({
      data: {
        usuarioId: user.id,
        acao: "restaurar",
        entidade: "backup",
        descricao: `Backup restaurado: ${file.name} (${uploadEntries.length} arquivos)`,
        dadosPosteriores: JSON.stringify({
          arquivo: file.name,
          manifestData: manifest.dataGeracao,
          arquivosRestaurados: uploadEntries.length,
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        mensagem: "Backup restaurado com sucesso!",
        arquivosRestaurados: uploadEntries.length,
        dataOriginal: manifest.dataGeracao,
        aviso: "Recomendado: reinicie o servidor para garantir que o cache do Prisma seja limpo.",
      },
    });
  } catch (err) {
    // Rollback: restaurar backups
    console.error("[restore] Erro, fazendo rollback:", err);
    try {
      if (fs.existsSync(dbBackupPath)) {
        fs.copyFileSync(dbBackupPath, dbPath);
        fs.unlinkSync(dbBackupPath);
      }
      if (fs.existsSync(uploadsBackupDir)) {
        if (fs.existsSync(uploadsDir)) {
          fs.rmSync(uploadsDir, { recursive: true, force: true });
        }
        fs.renameSync(uploadsBackupDir, uploadsDir);
      }
    } catch (rollbackErr) {
      console.error("[restore] Erro no rollback:", rollbackErr);
    }

    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ ok: false, error: `Falha ao restaurar: ${msg}. Rollback aplicado.` }, { status: 500 });
  }
}
