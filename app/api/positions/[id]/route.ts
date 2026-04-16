import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { id } = await params;
  const { data: existing } = await supabase.from("open_positions").select("company_id").eq("id", id).single();
  if (!existing || existing.company_id !== user.companyId) return forbidden("Not your position");

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (body.title) update.title = body.title;
  if (body.description) update.description = body.description;
  if (body.type) update.type = body.type;
  if (body.techStack) update.tech_stack = body.techStack;
  if (body.isActive !== undefined) update.is_active = body.isActive;

  const { error } = await supabase.from("open_positions").update(update).eq("id", id);
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const { id } = await params;

  if (user.role !== "ADMIN") {
    const { data: existing } = await supabase.from("open_positions").select("company_id").eq("id", id).single();
    if (!existing || existing.company_id !== user.companyId) return forbidden("Not your position");
  }

  const { error } = await supabase.from("open_positions").delete().eq("id", id);
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json({ success: true });
}
