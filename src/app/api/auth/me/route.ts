// GET /api/auth/me
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import type { ApiResult, ProfileDTO } from "@/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json<ApiResult<ProfileDTO>>({ ok: false, error: "Não autenticado" }, { status: 401 });
  }
  return NextResponse.json<ApiResult<ProfileDTO>>({ ok: true, data: user });
}
