// POST /api/auth/login
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/session";
import type { ApiResult, ProfileDTO } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const senha = String(body?.senha ?? "");

    if (!email || !senha) {
      return NextResponse.json<ApiResult<never>>(
        { ok: false, error: "Informe e-mail e senha." },
        { status: 400 },
      );
    }

    const user = await db.profile.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json<ApiResult<never>>(
        { ok: false, error: "Credenciais inválidas." },
        { status: 401 },
      );
    }

    if (user.status !== "ativo") {
      return NextResponse.json<ApiResult<never>>(
        { ok: false, error: "Usuário inativo ou suspenso. Procure o administrador." },
        { status: 403 },
      );
    }

    const senhaOk = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaOk) {
      return NextResponse.json<ApiResult<never>>(
        { ok: false, error: "Credenciais inválidas." },
        { status: 401 },
      );
    }

    await db.profile.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() },
    });

    const token = await createSession({
      uid: user.id,
      email: user.email,
      nome: user.nome,
      perfil: user.perfil as ProfileDTO["perfil"],
    });
    await setSessionCookie(token);

    return NextResponse.json<ApiResult<ProfileDTO>>({
      ok: true,
      data: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        avatar: user.avatar,
        perfil: user.perfil as ProfileDTO["perfil"],
        status: user.status as ProfileDTO["status"],
        ultimoAcesso: new Date().toISOString(),
        criadoEm: user.criadoEm.toISOString(),
      },
    });
  } catch (err) {
    console.error("[login] erro:", err);
    return NextResponse.json<ApiResult<never>>(
      { ok: false, error: "Falha ao processar login." },
      { status: 500 },
    );
  }
}
