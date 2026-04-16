import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { unauthorized } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return unauthorized("Invalid email or password");

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (userError || !user) return unauthorized("User not found");

  return Response.json({
    accessToken: data.session.access_token,
    user: { id: user.id, email: user.email, role: user.role, companyId: user.company_id },
  });
}
