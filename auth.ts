import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "dz_admin_session";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function sessionToken(): string {
  return createHash("sha256")
    .update(`dzstore::${adminPassword()}`)
    .digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === sessionToken();
}

export async function requireAdminApi(): Promise<Response | null> {
  if (await isAdmin()) return null;
  return Response.json({ error: "غير مصرح" }, { status: 401 });
}
