import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const body = await req.json();
  const { data, error } = await supabase
    .from("projects")
    .insert({ company_id: user.companyId, title: body.title, description: body.description, tech_stack: body.techStack, url: body.url || null })
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
