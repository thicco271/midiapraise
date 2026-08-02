import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const bannersDir = "/tmp/banners-cultos";
fs.mkdirSync(bannersDir, { recursive: true });

const cultos = [
  {
    nome: "Celebração da Família",
    data: "02/08/2026",
    horario: "Domingo 18h00",
    slug: "celebracao-familia-0208",
    tipo: "banner_telao",
    bg: "#0F2A5C",
    accent: "#C9A227",
  },
  {
    nome: "Terça da Vitória",
    data: "04/08/2026",
    horario: "19h30",
    slug: "terca-vitoria-0408",
    tipo: "banner_telao",
    bg: "#1B2A55",
    accent: "#E0C56A",
  },
  {
    nome: "Quarta Profética",
    data: "05/08/2026",
    horario: "19h30",
    slug: "quarta-profetica-0508",
    tipo: "banner_telao",
    bg: "#091E45",
    accent: "#C9A227",
  },
  {
    nome: "Escola Bíblica Dominical",
    data: "09/08/2026",
    horario: "Domingo 09h00",
    slug: "ebd-0908",
    tipo: "banner_telao",
    bg: "#0F2A5C",
    accent: "#C9A227",
  },
];

for (const c of cultos) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c.bg}"/>
        <stop offset="100%" stop-color="#091E45"/>
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#bg)"/>
    <!-- Decoração -->
    <circle cx="1750" cy="100" r="180" fill="${c.accent}" opacity="0.1"/>
    <circle cx="200" cy="950" r="220" fill="${c.accent}" opacity="0.08"/>
    <!-- Logo/Aplicações -->
    <text x="960" y="120" font-size="32" font-family="sans-serif" fill="${c.accent}" text-anchor="middle" letter-spacing="8">ADSA REIMBERG</text>
    <line x1="760" y1="160" x2="1160" y2="160" stroke="${c.accent}" stroke-width="2" opacity="0.5"/>
    <!-- Nome do culto -->
    <text x="960" y="500" font-size="100" font-family="Georgia, serif" font-weight="bold" fill="white" text-anchor="middle">${c.nome}</text>
    <!-- Data -->
    <text x="960" y="620" font-size="56" font-family="sans-serif" fill="${c.accent}" text-anchor="middle">${c.data}</text>
    <text x="960" y="700" font-size="40" font-family="sans-serif" fill="white" opacity="0.8" text-anchor="middle">${c.horario}</text>
    <!-- Local -->
    <text x="960" y="880" font-size="28" font-family="sans-serif" fill="white" opacity="0.6" text-anchor="middle">Templo ADSA Reimberg · Av. Antonio Carlos Benjamin dos Santos, 1203</text>
    <text x="960" y="930" font-size="22" font-family="sans-serif" fill="white" opacity="0.5" text-anchor="middle">Jardim Reimberg · São Paulo - SP</text>
  </svg>`;
  const out = path.join(bannersDir, `${c.slug}.png`);
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log(`Banner criado: ${out} (${fs.statSync(out).size} bytes)`);
}

console.log("\nPronto! Banners em:", bannersDir);
