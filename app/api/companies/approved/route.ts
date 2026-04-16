import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ message: error.message }, { status: 500 });
  if (!companies || companies.length === 0) return Response.json([]);

  const ids = companies.map((c) => c.id);
  const [members, projects] = await Promise.all([
    supabase.from("team_members").select("*").in("company_id", ids),
    supabase.from("projects").select("*").in("company_id", ids),
  ]);

  return Response.json(
    companies.map((c) => ({
      ...mapCompany(c),
      teamMembers: (members.data ?? []).filter((m: any) => m.company_id === c.id).map(mapMember),
      projects: (projects.data ?? []).filter((p: any) => p.company_id === c.id).map(mapProject),
    }))
  );
}

function mapCompany(c: any) {
  return { id: c.id, name: c.name, slug: c.slug, bio: c.bio, logo: c.logo, website: c.website, industry: c.industry, techStack: c.tech_stack, status: c.status, createdAt: c.created_at, updatedAt: c.updated_at };
}
function mapMember(m: any) {
  return { id: m.id, name: m.name, role: m.role, avatar: m.avatar, linkedin: m.linkedin, companyId: m.company_id, createdAt: m.created_at };
}
function mapProject(p: any) {
  return { id: p.id, title: p.title, description: p.description, techStack: p.tech_stack, url: p.url, image: p.image, companyId: p.company_id, createdAt: p.created_at };
}
