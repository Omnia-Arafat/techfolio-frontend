import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const { id } = await params;

  // Delete linked auth user
  const { data: linkedUser } = await supabase.from("users").select("id").eq("company_id", id).single();
  if (linkedUser) {
    await supabase.auth.admin.deleteUser(linkedUser.id);
    await supabase.from("users").delete().eq("id", linkedUser.id);
  }

  await supabase.from("open_positions").delete().eq("company_id", id);
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) return Response.json({ message: error.message }, { status: 500 });

  return Response.json({ success: true });
}
