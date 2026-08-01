// GET /api/categories
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ApiResult, EventCategoryDTO } from "@/types";

export async function GET() {
  const categorias = await db.eventCategory.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
  const dto: EventCategoryDTO[] = categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    icone: c.icone,
    ativo: c.ativo,
    ordem: c.ordem,
  }));
  return NextResponse.json<ApiResult<EventCategoryDTO[]>>({ ok: true, data: dto });
}
