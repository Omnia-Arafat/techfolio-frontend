import { supabase } from "./supabase";
import { NextRequest } from "next/server";

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "COMPANY";
  companyId: string | null;
}

export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const auth = req.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  if (!token) return null;
  return getUserFromToken(token);
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (userErr || !user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "COMPANY",
    companyId: user.company_id ?? null,
  };
}

export function unauthorized(message = "Unauthorized") {
  return Response.json({ message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return Response.json({ message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return Response.json({ message }, { status: 404 });
}

export function badRequest(message = "Bad request") {
  return Response.json({ message }, { status: 400 });
}
