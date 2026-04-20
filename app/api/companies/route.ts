import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import * as crypto from "crypto";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function generatePassword() {
  return crypto.randomBytes(6).toString("base64url");
}

export async function GET() {
  const { data, error } = await supabase
    .from("companies")
    .select("*, team_members(*), projects(*)")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const dto = await req.json();

  // Block duplicate email registrations
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", dto.email)
    .single();

  if (existingUser) {
    return Response.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  // Generate unique slug
  let slug = slugify(dto.name);
  let counter = 1;
  while (true) {
    const { data } = await supabase.from("companies").select("id").eq("slug", slug).single();
    if (!data) break;
    slug = `${slugify(dto.name)}-${counter++}`;
  }

  const { data: company, error } = await supabase
    .from("companies")
    .insert({ name: dto.name, slug, bio: dto.bio, industry: dto.industry, tech_stack: dto.techStack, website: dto.website || null, logo: dto.logo || null, status: "PENDING" })
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 500 });

  if (dto.teamMembers?.length > 0) {
    await supabase.from("team_members").insert(dto.teamMembers.map((m: any) => ({ company_id: company.id, name: m.name, role: m.role, linkedin: m.linkedin || null })));
  }

  if (dto.projects?.length > 0) {
    await supabase.from("projects").insert(dto.projects.map((p: any) => ({ company_id: company.id, title: p.title, description: p.description, tech_stack: p.techStack, url: p.url || null })));
  }

  const generatedPassword = generatePassword();
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({ email: dto.email, password: generatedPassword, email_confirm: true });
    if (!authError && authData.user) {
      await supabase.from("users").insert({ id: authData.user.id, email: dto.email, role: "COMPANY", company_id: company.id });
    }
  } catch (e) {
    console.error("Failed to create auth user:", e);
  }

  return Response.json({ id: company.id, email: dto.email, generatedPassword }, { status: 201 });
}
