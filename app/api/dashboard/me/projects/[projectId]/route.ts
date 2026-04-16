import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { projectId } = await params;
  const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("company_id", user.companyId);
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json({ success: true });
}
