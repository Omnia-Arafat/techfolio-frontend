import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { unauthorized } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  if (!token) return unauthorized();

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return unauthorized("Invalid token");

  const { password } = await req.json();
  const { error } = await supabase.auth.admin.updateUserById(userData.user.id, { password });
  if (error) return Response.json({ message: error.message }, { status: 400 });

  return Response.json({ success: true });
}
