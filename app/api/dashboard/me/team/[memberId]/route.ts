import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { memberId } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.role !== undefined) update.role = body.role;
  if (body.linkedin !== undefined) update.linkedin = body.linkedin || null;

  const { data, error } = await supabase
    .from("team_members")
    .update(update)
    .eq("id", memberId)
    .eq("company_id", user.companyId)
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { memberId } = await params;
  const { error } = await supabase.from("team_members").delete().eq("id", memberId).eq("company_id", user.companyId);
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json({ success: true });
}
