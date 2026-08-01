import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Permite servir imagens da pasta public/uploads sem otimização do next/image
  // (usamos <img> com caminho direto, então não precisamos de domínios externos)
  experimental: {
    // Garante que arquivos em public/ sejam copiados para o standalone build
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
