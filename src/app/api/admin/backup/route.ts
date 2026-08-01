// GET /api/admin/backup - gera ZIP com DB + uploads e envia como download
// Usa adm-zip (mais simples que archiver para este caso)
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import AdmZip from "adm-zip";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min para backups grandes

export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.perfil !== "administrador") {
    return NextResponse.json({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const dbPath = path.join(process.cwd(), "db", "custom.db");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ ok: false, error: "Banco de dados não encontrado" }, { status: 500 });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const nomeZip = `backup-reimberg-${timestamp}.zip`;

  // Coletar info para manifest
  let uploadsCount = 0;
  let uploadsSize = 0;
  const walkDir = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(full);
      } else {
        uploadsCount++;
        try {
          uploadsSize += fs.statSync(full).size;
        } catch {}
      }
    }
  };
  walkDir(uploadsDir);

  const manifest = {
    aplicacao: "ADSA Reimberg Mídias",
    versao: "0.3.0",
    dataGeracao: new Date().toISOString(),
    geradoPor: user.nome,
    database: { arquivo: "database/custom.db" },
    uploads: {
      pasta: "uploads/",
      base: "public/uploads",
      quantidadeArquivos: uploadsCount,
      tamanhoTotalBytes: uploadsSize,
    },
  };

  // Criar ZIP
  const zip = new AdmZip();

  // Adicionar DB
  zip.addLocalFile(dbPath, "database");

  // Adicionar uploads recursivamente
  const addDirToZip = (dir: string, zipPath: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const entryZipPath = zipPath ? `${zipPath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        zip.addFile(`${entryZipPath}/`, Buffer.alloc(0));
        addDirToZip(full, entryZipPath);
      } else {
        zip.addLocalFile(full, zipPath);
      }
    }
  };
  addDirToZip(uploadsDir, "uploads");

  // Adicionar manifest
  zip.addFile("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2), "utf8"));

  // README
  const readme = `# Backup ADSA Reimberg Mídias

Gerado em: ${manifest.dataGeracao}
Por: ${manifest.geradoPor}

## Conteúdo

- database/custom.db — banco SQLite completo
- uploads/ — todos os arquivos físicos (${uploadsCount} arquivos, ${(uploadsSize / 1024 / 1024).toFixed(1)} MB)
- manifest.json — metadados do backup

## Como restaurar

1. Acesse /admin/backup como administrador
2. Clique em "Restaurar backup"
3. Selecione este arquivo .zip
4. Confirme

## Aviso

Restaurar um backup SUBSTITUI completamente os dados atuais.
`;
  zip.addFile("README.md", Buffer.from(readme, "utf8"));

  // Gerar buffer
  const buffer = zip.toBuffer();

  // Auditoria
  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "criar",
      entidade: "backup",
      descricao: `Backup gerado: ${nomeZip} (${uploadsCount} arquivos, ${(uploadsSize / 1024 / 1024).toFixed(1)} MB uploads, ZIP ${(buffer.length / 1024).toFixed(0)} KB)`,
      dadosPosteriores: JSON.stringify({
        arquivo: nomeZip,
        tamanhoZip: buffer.length,
        uploadsCount,
        uploadsSize,
      }),
    },
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(nomeZip)}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store",
    },
  });
}
