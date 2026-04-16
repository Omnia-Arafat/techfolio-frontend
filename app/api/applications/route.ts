import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { positionId, applicantName, applicantEmail, message, applicantCompanyId } = body;

  const { data: position } = await supabase.from("open_positions").select("id, company_id, is_active").eq("id", positionId).single();
  if (!position || !position.is_active) return Response.json({ message: "Position not found or closed" }, { status: 404 });

  if (applicantCompanyId && applicantCompanyId === position.company_id) {
    return Response.json({ message: "Cannot apply to your own position" }, { status: 403 });
  }

  const { data: existing } = await supabase.from("job_applications").select("id").eq("position_id", positionId).eq("applicant_email", applicantEmail).single();
  if (existing) return Response.json({ message: "You have already applied to this position" }, { status: 403 });

  const { data: app, error } = await supabase
    .from("job_applications")
    .insert({ position_id: positionId, applicant_company_id: applicantCompanyId || null, applicant_name: applicantName, applicant_email: applicantEmail, message: message || null, status: "PENDING" })
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 500 });
  return Response.json(mapApp(app), { status: 201 });
}

function mapApp(a: any) {
  return { id: a.id, positionId: a.position_id, applicantCompanyId: a.applicant_company_id, applicantName: a.applicant_name, applicantEmail: a.applicant_email, message: a.message, status: a.status, createdAt: a.created_at };
}
