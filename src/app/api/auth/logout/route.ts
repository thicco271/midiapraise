// POST /api/auth/logout
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";
import type { ApiResult } from "@/types";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json<ApiResult<{ ok: true }>>({ ok: true, data: { ok: true } });
}
