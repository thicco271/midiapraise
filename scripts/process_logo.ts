// Processa o logo ADSA: remove fundo preto, gera versões para header/claro e fundo escuro
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const input = "/home/z/my-project/upload/pasted_image_1785618555443.png";
  const publicDir = "/home/z/my-project/public";

  // 1. Logo para fundo claro (azul escuro sobre transparente) — para header
  // Remove o fundo preto: pixels próximos de preto ficam transparentes
  await sharp(input)
    .flatten({ background: "#FFFFFF" })
    .resize({ width: 200, height: 200, fit: "inside", withoutEnlargement: true })
    .png()
    .toFile(path.join(publicDir, "logo-adsa-branco.png"));

  // 2. Logo original (branco sobre transparente) — para fundo escuro (header azul)
  // Manter branco, mas tornar o preto transparente
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Processar pixel a pixel: pixels escuros (preto) viram transparentes
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = info.channels === 4 ? data[i + 3] : 255;

    // Se pixel for escuro (fundo preto), tornar transparente
    const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luminancia < 30) {
      // Fundo preto → transparente
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
    } else {
      // Manter branco/cinza
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = a;
    }
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .resize({ width: 200, height: 200, fit: "inside", withoutEnlargement: true })
    .png()
    .toFile(path.join(publicDir, "logo-adsa-transparente.png"));

  // 3. Versão azul profundo (para fundo claro) — recolore o branco para azul
  const azulR = 15, azulG = 42, azulB = 92; // #0F2A5C
  const dataAzul = Buffer.from(out); // copia
  for (let i = 0; i < dataAzul.length; i += info.channels) {
    const a = dataAzul[i + 3];
    if (a > 0) {
      // Pixel visível (branco) → recolorir para azul
      dataAzul[i] = azulR;
      dataAzul[i + 1] = azulG;
      dataAzul[i + 2] = azulB;
      dataAzul[i + 3] = a;
    }
  }
  await sharp(dataAzul, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .resize({ width: 200, height: 200, fit: "inside", withoutEnlargement: true })
    .png()
    .toFile(path.join(publicDir, "logo-adsa-azul.png"));

  console.log("Logos gerados:");
  console.log("  - logo-adsa-transparente.png (branco, fundo transparente - para header azul)");
  console.log("  - logo-adsa-azul.png (azul profundo, fundo transparente - para fundo claro)");
  console.log("  - logo-adsa-branco.png (sobre fundo branco)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
