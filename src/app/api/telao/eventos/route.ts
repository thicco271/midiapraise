// GET /api/telao/eventos - lista eventos publicados com info sobre tem banner_telao
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatarData } from "@/lib/praise";

export async function GET() {
  const eventos = await db.event.findMany({
    where: {
      status: "publicado",
      visibilidade: "publico",
    },
    include: {
      categoria: true,
      mediaAssets: {
        where: {
          tipo: "banner_telao",
          status: "publicado",
          visibilidade: "publico",
        },
        select: { id: true },
      },
    },
    orderBy: { data: "asc" },
  });

  return NextResponse.json({
    ok: true,
    data: eventos.map((e) => ({
      id: e.id,
      nome: e.nome,
      slug: e.slug,
      data: e.data.toISOString(),
      dataFormatada: formatarData(e.data),
      horarioInicio: e.horarioInicio,
      categoria: e.categoria?.nome ?? null,
      temBannerTelao: e.mediaAssets.length > 0,
      totalBanners: e.mediaAssets.length,
    })),
  });
}
