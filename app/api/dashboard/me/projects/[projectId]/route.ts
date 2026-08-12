import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { projectId } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.description !== undefined) update.description = body.description;
  if (body.techStack !== undefined) update.tech_stack = body.techStack;
  if (body.url !== undefined) update.url = body.url || null;

  const { data, error } = await supabase
    .from("projects")
    .update(update)
    .eq("id", projectId)
    .eq("company_id", user.companyId)
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { projectId } = await params;
  const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("company_id", user.companyId);
  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json({ success: true });
}
