import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { notFound } from "@/lib/auth-utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: company, error } = await supabase.from("companies").select("*").eq("slug", slug).single();
  if (error || !company) return notFound("Company not found");

  const [members, projects] = await Promise.all([
    supabase.from("team_members").select("*").eq("company_id", company.id),
    supabase.from("projects").select("*").eq("company_id", company.id),
  ]);

  return Response.json({
    id: company.id, name: company.name, slug: company.slug, bio: company.bio,
    logo: company.logo, website: company.website, industry: company.industry,
    techStack: company.tech_stack, status: company.status,
    createdAt: company.created_at, updatedAt: company.updated_at,
    teamMembers: (members.data ?? []).map((m: any) => ({ id: m.id, name: m.name, role: m.role, avatar: m.avatar, linkedin: m.linkedin, companyId: m.company_id, createdAt: m.created_at })),
    projects: (projects.data ?? []).map((p: any) => ({ id: p.id, title: p.title, description: p.description, techStack: p.tech_stack, url: p.url, image: p.image, companyId: p.company_id, createdAt: p.created_at })),
  });
}
