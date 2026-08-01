import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const assets = await db.mediaAsset.findMany({
    include: { versoes: true, evento: { select: { nome: true, slug: true } } },
  });
  for (const a of assets) {
    console.log("---");
    console.log("Asset:", a.id);
    console.log("  Evento:", a.evento.nome);
    console.log("  Nome:", a.nome);
    console.log("  Tipo:", a.tipo, "| Status:", a.status, "| Versão atual:", a.versaoAtual);
    console.log("  Versões:", a.versoes.length);
    for (const v of a.versoes) {
      console.log("    v" + v.numeroDaVersao, "→", v.caminhoDoArquivo, "(" + v.tamanho + "B, " + v.mimeType + ")", v.arquivoOficial ? "[OFICIAL]" : "");
      if (v.caminhoThumbnail) console.log("       thumb:", v.caminhoThumbnail);
    }
  }
}
main().finally(() => db.$disconnect());
