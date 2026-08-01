import { db } from "@/lib/db";
import { selecionarProximoCulto } from "@/lib/praise";
import { TelaoPlayer } from "@/components/praisehub/telao-player";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Modo Telão · ADSA Reimberg Mídias",
  description: "Exibição em tela cheia para projeção durante os cultos.",
};

async function getDados(eventoSlug?: string) {
  // Se slug foi fornecido, busca aquele evento específico
  if (eventoSlug) {
    const evento = await db.event.findUnique({
      where: { slug: eventoSlug },
      include: { categoria: true },
    });

    if (evento && (evento.status === "publicado" || evento.visibilidade === "publico")) {
      // Busca apenas mídias publicadas do tipo banner_telao
      const medias = await db.mediaAsset.findMany({
        where: {
          eventoId: evento.id,
          tipo: "banner_telao",
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

      const mediasDTO = medias
        .filter((m) => m.versoes[0])
        .map((m) => ({
          id: m.id,
          nome: m.nome,
          caminhoDoArquivo: m.versoes[0].caminhoDoArquivo,
          caminhoThumbnail: m.versoes[0].caminhoThumbnail,
          nomePadronizado: m.versoes[0].nomePadronizado,
          largura: m.versoes[0].largura,
          altura: m.versoes[0].altura,
        }));

      return {
        evento: {
          id: evento.id,
          nome: evento.nome,
          slug: evento.slug,
          data: evento.data.toISOString(),
          horarioInicio: evento.horarioInicio,
          horarioFim: evento.horarioFim,
          local: evento.local,
          endereco: evento.endereco,
          tema: evento.tema,
          versiculo: evento.versiculo,
          pregador: evento.pregador,
          categoria: evento.categoria ? { nome: evento.categoria.nome } : null,
        },
        medias: mediasDTO,
        proximoEvento: null,
      };
    }
  }

  // Sem slug: busca próximo culto automaticamente
  const eventos = await db.event.findMany({
    where: {
      status: "publicado",
      visibilidade: "publico",
    },
    include: { categoria: true },
    orderBy: { data: "asc" },
  });

  const agora = new Date();
  const proximoCulto = selecionarProximoCulto(eventos, agora);

  if (!proximoCulto) {
    return { evento: null, medias: [], proximoEvento: null };
  }

  // Busca mídias do tipo banner_telao do próximo culto
  const medias = await db.mediaAsset.findMany({
    where: {
      eventoId: proximoCulto.id,
      tipo: "banner_telao",
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

  const mediasDTO = medias
    .filter((m) => m.versoes[0])
    .map((m) => ({
      id: m.id,
      nome: m.nome,
      caminhoDoArquivo: m.versoes[0].caminhoDoArquivo,
      caminhoThumbnail: m.versoes[0].caminhoThumbnail,
      nomePadronizado: m.versoes[0].nomePadronizado,
      largura: m.versoes[0].largura,
      altura: m.versoes[0].altura,
    }));

  return {
    evento: {
      id: proximoCulto.id,
      nome: proximoCulto.nome,
      slug: proximoCulto.slug,
      data: proximoCulto.data.toISOString(),
      horarioInicio: proximoCulto.horarioInicio,
      horarioFim: proximoCulto.horarioFim,
      local: proximoCulto.local,
      endereco: proximoCulto.endereco,
      tema: proximoCulto.tema,
      versiculo: proximoCulto.versiculo,
      pregador: proximoCulto.pregador,
      categoria: proximoCulto.categoria ? { nome: proximoCulto.categoria.nome } : null,
    },
    medias: mediasDTO,
    proximoEvento: null,
  };
}

export default async function TelaoPage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string }>;
}) {
  const sp = await searchParams;
  const eventoSlug = sp.evento;
  const dados = await getDados(eventoSlug);

  return <TelaoPlayer evento={dados.evento} medias={dados.medias} proximoEvento={dados.proximoEvento} />;
}
