import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const { data: companies, error } = await supabase.from("companies").select("*").order("created_at", { ascending: false });
  if (error) return Response.json({ message: error.message }, { status: 500 });
  if (!companies?.length) return Response.json([]);

  const ids = companies.map((c) => c.id);
  const [members, projects] = await Promise.all([
    supabase.from("team_members").select("*").in("company_id", ids),
    supabase.from("projects").select("*").in("company_id", ids),
  ]);

  return Response.json(
    companies.map((c) => ({
      id: c.id, name: c.name, slug: c.slug, bio: c.bio, logo: c.logo, website: c.website,
      industry: c.industry, techStack: c.tech_stack, status: c.status,
      createdAt: c.created_at, updatedAt: c.updated_at,
      teamMembers: (members.data ?? []).filter((m: any) => m.company_id === c.id),
      projects: (projects.data ?? []).filter((p: any) => p.company_id === c.id),
    }))
  );
}
