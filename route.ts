import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { ADMIN_COOKIE, adminPassword, sessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password = String(body.password ?? "");

  if (password !== adminPassword()) {
    return Response.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
