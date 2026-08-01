// GET  /api/church-settings  -> retorna settings públicas (ou completas p/ admin)
// PATCH /api/church-settings  -> atualiza settings (admin)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, canEditSettings } from "@/lib/session";
import type { ApiResult, ChurchSettingsDTO } from "@/types";

export async function GET() {
  const settings = await db.churchSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    return NextResponse.json<ApiResult<ChurchSettingsDTO>>({ ok: false, error: "Configurações não encontradas" }, { status: 404 });
  }
  const user = await getCurrentUser();
  const isAdmin = user && canEditSettings(user.perfil);
  const dto: ChurchSettingsDTO = {
    id: settings.id,
    nomeDaIgreja: settings.nomeDaIgreja,
    nomeDaAplicacao: settings.nomeDaAplicacao,
    subtitulo: settings.subtitulo,
    textoPrincipal: settings.textoPrincipal,
    textoComplementar: settings.textoComplementar,
    logo: settings.logo,
    icone: settings.icone,
    imagemDeCapa: settings.imagemDeCapa,
    corPrimaria: settings.corPrimaria,
    corDestaque: settings.corDestaque,
    endereco: settings.endereco,
    fusoHorario: settings.fusoHorario,
  };
  // Se não for admin, retornamos apenas campos públicos
  if (!isAdmin) {
    return NextResponse.json<ApiResult<Partial<ChurchSettingsDTO>>>({
      ok: true,
      data: {
        nomeDaIgreja: dto.nomeDaIgreja,
        nomeDaAplicacao: dto.nomeDaAplicacao,
        subtitulo: dto.subtitulo,
        textoPrincipal: dto.textoPrincipal,
        textoComplementar: dto.textoComplementar,
        logo: dto.logo,
        icone: dto.icone,
        imagemDeCapa: dto.imagemDeCapa,
        corPrimaria: dto.corPrimaria,
        corDestaque: dto.corDestaque,
        endereco: dto.endereco,
        fusoHorario: dto.fusoHorario,
      },
    });
  }
  return NextResponse.json<ApiResult<ChurchSettingsDTO>>({ ok: true, data: dto });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEditSettings(user.perfil)) {
    return NextResponse.json<ApiResult<never>>({ ok: false, error: "Sem permissão" }, { status: 403 });
  }
  const body = await req.json();
  const permitidos: (keyof ChurchSettingsDTO)[] = [
    "nomeDaIgreja",
    "nomeDaAplicacao",
    "subtitulo",
    "textoPrincipal",
    "textoComplementar",
    "logo",
    "icone",
    "imagemDeCapa",
    "corPrimaria",
    "corDestaque",
    "endereco",
    "fusoHorario",
  ];
  const dados: Record<string, string> = {};
  for (const k of permitidos) {
    if (typeof body?.[k] === "string" && body[k].trim().length > 0) {
      dados[k] = body[k].trim();
    }
  }
  const atualizado = await db.churchSettings.update({
    where: { id: "singleton" },
    data: dados,
  });
  await db.auditLog.create({
    data: {
      usuarioId: user.id,
      acao: "atualizar",
      entidade: "church_settings",
      entidadeId: atualizado.id,
      descricao: "Configurações da igreja atualizadas",
      dadosPosteriores: JSON.stringify(dados),
    },
  });
  return NextResponse.json<ApiResult<ChurchSettingsDTO>>({
    ok: true,
    data: {
      id: atualizado.id,
      nomeDaIgreja: atualizado.nomeDaIgreja,
      nomeDaAplicacao: atualizado.nomeDaAplicacao,
      subtitulo: atualizado.subtitulo,
      textoPrincipal: atualizado.textoPrincipal,
      textoComplementar: atualizado.textoComplementar,
      logo: atualizado.logo,
      icone: atualizado.icone,
      imagemDeCapa: atualizado.imagemDeCapa,
      corPrimaria: atualizado.corPrimaria,
      corDestaque: atualizado.corDestaque,
      endereco: atualizado.endereco,
      fusoHorario: atualizado.fusoHorario,
    },
  });
}
