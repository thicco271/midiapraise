// ADSA Reimberg Mídias - Sessão simples baseada em cookie assinado
// Mantém o estado de autenticação sem dependência externa pesada.

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { Perfil, ProfileDTO } from "@/types";

const SESSION_COOKIE = "praisehub_session";
const SESSION_SECRET = process.env.PRAISEHUB_SESSION_SECRET || "praisehub-dev-secret-change-in-prod-2026";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

const encoder = new TextEncoder();

function getKey() {
  return encoder.encode(SESSION_SECRET);
}

export interface SessionPayload {
  uid: string;
  email: string;
  nome: string;
  perfil: Perfil;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getKey());
  return token;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey());
    if (!payload.uid || !payload.perfil) return null;
    return {
      uid: payload.uid as string,
      email: payload.email as string,
      nome: payload.nome as string,
      perfil: payload.perfil as Perfil,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<ProfileDTO | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await db.profile.findUnique({
    where: { id: payload.uid },
  });
  if (!user || user.status !== "ativo") return null;

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    avatar: user.avatar,
    perfil: user.perfil as Perfil,
    status: user.status as "ativo" | "suspenso" | "inativo",
    ultimoAcesso: user.ultimoAcesso?.toISOString() ?? null,
    criadoEm: user.criadoEm.toISOString(),
  };
}

export function canManageEvents(perfil: Perfil): boolean {
  return perfil === "administrador" || perfil === "editor";
}

export function canApprove(perfil: Perfil): boolean {
  return perfil === "administrador" || perfil === "aprovador";
}

export function canAccessAdmin(perfil: Perfil): boolean {
  return perfil !== "visitante";
}

export function canEditSettings(perfil: Perfil): boolean {
  return perfil === "administrador";
}
