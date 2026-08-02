// GET /api/events/[id]/download-zip
// Gera um ZIP com todas as mídias publicadas do evento e envia como download
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import AdmZip from "adm-zip";
import path from "node:path";
import fs from "node:fs";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Buscar evento por id ou slug
  const evento = await db.event.findUnique({ where: { id } })
    ?? await db.event.findUnique({ where: { slug: id } });

  if (!evento) {
    return new NextResponse("Evento não encontrado", { status: 404 });
  }

  // Buscar todas as mídias publicadas
  const assets = await db.mediaAsset.findMany({
    where: {
      eventoId: evento.id,
      status: "publicado",
      visibilidade: "publico",
    },
    include: {
      versoes: {
        where: { arquivoOficial: true },
        take: 1,
      },
    },
  });

  if (assets.length === 0) {
    return new NextResponse("Nenhuma arte publicada para este evento", { status: 404 });
  }

  // Criar ZIP
  const zip = new AdmZip();
  const publicDir = path.join(process.cwd(), "public");
  let arquivosAdicionados = 0;

  for (const asset of assets) {
    const versao = asset.versoes[0];
    if (!versao) continue;

    const url = versao.caminhoDoArquivo;

    // Se for URL do Supabase (https://), baixar
    if (url.startsWith("http")) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          // Nome da pasta por tipo
          const pasta = asset.tipo === "banner_telao" ? "Banner-Telao"
            : asset.tipo === "rede_social" ? "Redes-Sociais"
            : asset.tipo === "whatsapp" ? "WhatsApp"
            : "Outros";
          zip.addFile(`${pasta}/${versao.nomePadronizado}`, buffer);
          arquivosAdicionados++;
        }
      } catch (err) {
        console.warn("[download-zip] Falha ao baixar:", url);
      }
    } else {
      // Arquivo local
      const rel = url.startsWith("/") ? url.slice(1) : url;
      const abs = path.join(publicDir, rel);
      if (fs.existsSync(abs)) {
        const buffer = fs.readFileSync(abs);
        const pasta = asset.tipo === "banner_telao" ? "Banner-Telao"
          : asset.tipo === "rede_social" ? "Redes-Sociais"
          : asset.tipo === "whatsapp" ? "WhatsApp"
          : "Outros";
        zip.addFile(`${pasta}/${versao.nomePadronizado}`, buffer);
        arquivosAdicionados++;
      }
    }
  }

  if (arquivosAdicionados === 0) {
    return new NextResponse("Nenhum arquivo encontrado", { status: 404 });
  }

  // Adicionar README
  const readme = `Artes oficiais — ${evento.nome}

Evento: ${evento.nome}
Data: ${new Date(evento.data).toLocaleDateString("pt-BR")}
Total de arquivos: ${arquivosAdicionados}

Organização:
- Banner-Telao/ — artes para projeção (16:9)
- Redes-Sociais/ — artes para Instagram/Facebook
- WhatsApp/ — artes para WhatsApp e Stories
- Outros/ — demais arquivos

ADSA Reimberg Mídias
`;
  zip.addFile("LEIA-ME.txt", Buffer.from(readme, "utf8"));

  const zipBuffer = zip.toBuffer();
  const nomeZip = `${evento.slug}-artes.zip`;

  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(nomeZip)}"`,
      "Content-Length": String(zipBuffer.length),
      "Cache-Control": "no-store",
    },
  });
}
