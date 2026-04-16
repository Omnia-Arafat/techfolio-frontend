import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const body = await req.json();
  const { data, error } = await supabase
    .from("team_members")
    .insert({ company_id: user.companyId, name: body.name, role: body.role, linkedin: body.linkedin || null })
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
