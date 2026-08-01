import sharp from "sharp";
import fs from "node:fs";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F2A5C"/>
      <stop offset="100%" stop-color="#091E45"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <text x="960" y="500" font-size="120" font-family="Georgia, serif" font-weight="bold" fill="white" text-anchor="middle">Culto da Família</text>
  <text x="960" y="620" font-size="60" font-family="sans-serif" fill="#C9A227" text-anchor="middle">09/08/2026 · 19:30</text>
  <text x="960" y="750" font-size="40" font-family="sans-serif" fill="white" opacity="0.7" text-anchor="middle">ADSA Reimberg</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile("/tmp/banner-telao.png");
console.log("Banner criado:", fs.statSync("/tmp/banner-telao.png").size, "bytes");
