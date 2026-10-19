import { NextRequest } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ settings: await getSettings() });
}

export async function PUT(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const body = (await request.json()) as Record<string, unknown>;
  const entries = Object.entries(body).filter(([key]) => key.length > 0 && key.length <= 80);

  for (const [key, value] of entries) {
    await db
      .insert(settings)
      .values({ key, value: String(value ?? "") })
      .onConflictDoUpdate({ target: settings.key, set: { value: String(value ?? "") } });
  }

  return Response.json({ settings: await getSettings() });
}
