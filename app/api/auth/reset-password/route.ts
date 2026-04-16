import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ success: true, message: "Reset link sent if the email exists." });
}
