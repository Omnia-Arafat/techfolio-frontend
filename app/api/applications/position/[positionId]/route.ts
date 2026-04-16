import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ positionId: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { positionId } = await params;

  const { data: position } = await supabase.from("open_positions").select("company_id").eq("id", positionId).single();
  if (!position || position.company_id !== user.companyId) return forbidden("Not your position");

  const { data, error } = await supabase
    .from("job_applications")
    .select("*, companies:applicant_company_id(name, slug, industry)")
    .eq("position_id", positionId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ message: error.message }, { status: 500 });

  return Response.json(
    (data ?? []).map((a: any) => ({
      id: a.id, positionId: a.position_id, applicantCompanyId: a.applicant_company_id,
      applicantName: a.applicant_name, applicantEmail: a.applicant_email,
      message: a.message, status: a.status, createdAt: a.created_at,
      applicantCompany: a.companies ? { name: a.companies.name, slug: a.companies.slug, industry: a.companies.industry } : null,
    }))
  );
}
