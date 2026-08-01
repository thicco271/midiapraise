import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function main() {
  const dir = "/tmp/fotos-teste";
  fs.mkdirSync(dir, { recursive: true });

  for (let i = 1; i <= 3; i++) {
    // Gera imagens coloridas 800x600
    const r = (i * 80) % 255;
    const g = (i * 130) % 255;
    const b = (i * 200) % 255;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="rgb(${r},${g},${b})"/>
      <text x="400" y="300" font-size="80" font-family="sans-serif" fill="white" text-anchor="middle">Foto ${i}</text>
    </svg>`;
    const out = path.join(dir, `foto-${i}.jpg`);
    await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(out);
    console.log("Criada:", out, fs.statSync(out).size, "bytes");
  }
}
main();
