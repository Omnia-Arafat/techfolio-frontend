import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function GET() {
  const { data, error } = await supabase
    .from("open_positions")
    .select("*, companies!inner(name, slug, industry, logo, status)")
    .eq("is_active", true)
    .eq("companies.status", "APPROVED")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ message: error.message }, { status: 500 });

  return Response.json(
    (data ?? []).map((p: any) => ({
      id: p.id, companyId: p.company_id, title: p.title, description: p.description,
      type: p.type, techStack: p.tech_stack, isActive: p.is_active, createdAt: p.created_at,
      company: p.companies ? { name: p.companies.name, slug: p.companies.slug, industry: p.companies.industry, logo: p.companies.logo } : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();
  if (!user.companyId) return forbidden("No company associated with this account");

  const body = await req.json();
  const { data, error } = await supabase
    .from("open_positions")
    .insert({ company_id: user.companyId, title: body.title, description: body.description, type: body.type, tech_stack: body.techStack, is_active: true })
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 500 });

  return Response.json({ id: data.id, companyId: data.company_id, title: data.title, description: data.description, type: data.type, techStack: data.tech_stack, isActive: data.is_active, createdAt: data.created_at }, { status: 201 });
}
