import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // Impede que o Next.js tente pré-renderizar páginas que acessam banco
  // (resolve o erro de DATABASE_URL durante o build na Vercel)
  staticPageGenerationTimeout: 1000,
};

export default nextConfig;
