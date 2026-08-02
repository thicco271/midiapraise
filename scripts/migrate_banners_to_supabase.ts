// Sobe os banners existentes para o Supabase Storage
// e atualiza os caminhos no banco
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const db = new PrismaClient();
const supabase = createClient(
  "https://hlvimdqsrwnlivnstpnr.supabase.co",
  "sb_publishable_w3YgOEaAY0kMgL3RcILW1Q_WRBSxba5"
);
const BUCKET = "midias";

async function main() {
  console.log("[migrate-banners] Iniciando migração de banners para Supabase Storage...");

  const medias = await db.mediaAsset.findMany({
    include: {
      versoes: true,
      evento: { select: { nome: true, slug: true } },
    },
  });

  console.log(`[migrate-banners] Encontradas ${medias.length} mídias`);

  for (const media of medias) {
    for (const versao of media.versoes) {
      const caminhoLocal = versao.caminhoDoArquivo;
      
      // Se já é URL do Supabase, pula
      if (caminhoLocal.startsWith("http")) {
        console.log(`[${media.nome}] Já é URL do Supabase — pulando`);
        continue;
      }

      // Converter caminho relativo para caminho físico
      const rel = caminhoLocal.startsWith("/") ? caminhoLocal.slice(1) : caminhoLocal;
      const abs = path.join(process.cwd(), "public", rel);

      if (!fs.existsSync(abs)) {
        console.log(`[${media.nome}] Arquivo não existe: ${abs} — pulando`);
        continue;
      }

      const buffer = fs.readFileSync(abs);
      const storagePath = `eventos/${media.evento.slug}/${media.tipo}/${versao.nomePadronizado}`;

      // Upload para Supabase
      try {
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, buffer, {
            contentType: versao.mimeType,
            upsert: true,
          });

        if (error) {
          console.log(`[${media.nome}] Erro upload: ${error.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(storagePath);

        const novaUrl = urlData.publicUrl;
        console.log(`[${media.nome}] Upload OK: ${novaUrl}`);

        // Upload thumbnail se existir
        let novaThumbUrl = versao.caminhoThumbnail;
        if (versao.caminhoThumbnail && !versao.caminhoThumbnail.startsWith("http")) {
          const thumbRel = versao.caminhoThumbnail.startsWith("/") 
            ? versao.caminhoThumbnail.slice(1) 
            : versao.caminhoThumbnail;
          const thumbAbs = path.join(process.cwd(), "public", thumbRel);
          
          if (fs.existsSync(thumbAbs)) {
            const thumbBuffer = fs.readFileSync(thumbAbs);
            const thumbPath = `eventos/${media.evento.slug}/${media.tipo}/thumbs/${versao.nomePadronizado.replace(/\.[^.]+$/, "")}-thumb.jpg`;
            
            const { error: thumbError } = await supabase.storage
              .from(BUCKET)
              .upload(thumbPath, thumbBuffer, {
                contentType: "image/jpeg",
                upsert: true,
              });

            if (!thumbError) {
              const { data: thumbUrlData } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(thumbPath);
              novaThumbUrl = thumbUrlData.publicUrl;
              console.log(`[${media.nome}] Thumb OK: ${novaThumbUrl}`);
            }
          }
        }

        // Atualizar banco
        await db.mediaVersion.update({
          where: { id: versao.id },
          data: {
            caminhoDoArquivo: novaUrl,
            caminhoThumbnail: novaThumbUrl,
          },
        });

        // Atualizar capa do evento
        if (versao.arquivoOficial) {
          await db.event.update({
            where: { id: media.eventoId },
            data: { capa: novaUrl },
          });
        }
      } catch (err) {
        console.log(`[${media.nome}] Erro:`, err);
      }
    }
  }

  console.log("\n[migrate-banners] Migração concluída!");
  
  // Resumo
  const finais = await db.mediaVersion.findMany({
    select: { caminhoDoArquivo: true, mediaAsset: { select: { nome: true } } },
  });
  console.log("\nURLs finais:");
  for (const v of finais) {
    console.log(`  ${v.mediaAsset.nome}: ${v.caminhoDoArquivo}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
