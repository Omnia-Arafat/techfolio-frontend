import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { data, error } = await supabase
    .from("open_positions")
    .select("*")
    .eq("company_id", user.companyId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ message: error.message }, { status: 500 });

  return Response.json(
    (data ?? []).map((p: any) => ({ id: p.id, companyId: p.company_id, title: p.title, description: p.description, type: p.type, techStack: p.tech_stack, isActive: p.is_active, createdAt: p.created_at }))
  );
}
