import { requireAdminApi } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  return Response.json(await getDashboardStats());
}
