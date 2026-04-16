import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { unauthorized } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  if (!token) return unauthorized();

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return unauthorized("Session expired - please sign in again");

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (userErr || !user) return unauthorized("User not found");

  return Response.json({
    accessToken: token,
    user: { id: user.id, email: user.email, role: user.role, companyId: user.company_id },
  });
}
