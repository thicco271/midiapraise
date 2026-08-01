// Garante que o endereço da igreja está sempre presetado
// Pode ser executado várias vezes (idempotente)
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  console.log("[fix-endereco] Verificando endereço…");
  const s = await db.churchSettings.findUnique({ where: { id: "singleton" } });
  if (!s) {
    console.log("[fix-endereco] ChurchSettings não encontrada — criando…");
    await db.churchSettings.create({
      data: {
        id: "singleton",
        nomeDaIgreja: "ADSA Reimberg",
        nomeDaAplicacao: "ADSA Reimberg Mídias",
        subtitulo: "Central de Mídia ADSA Reimberg",
        endereco: "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP, 04845-085",
        logo: "/logo-adsa-azul.png",
        icone: "/logo-adsa-transparente.png",
      },
    });
  } else if (!s.endereco || s.endereco.length < 10) {
    console.log("[fix-endereco] Endereço vazio — atualizando…");
    await db.churchSettings.update({
      where: { id: "singleton" },
      data: {
        endereco: "Av. Antonio Carlos Benjamin dos Santos, 1203 - Jardim Reimberg, São Paulo - SP, 04845-085",
        logo: s.logo || "/logo-adsa-azul.png",
        icone: s.icone || "/logo-adsa-transparente.png",
      },
    });
  } else {
    console.log("[fix-endereco] Endereço já está presetado:", s.endereco);
  }
}

main().finally(() => db.$disconnect());
