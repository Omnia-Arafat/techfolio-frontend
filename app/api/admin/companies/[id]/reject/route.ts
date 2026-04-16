import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const { id } = await params;
  const { error } = await supabase.from("companies").update({ status: "REJECTED", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json({ success: true });
}
