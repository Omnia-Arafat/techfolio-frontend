import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { data, error } = await supabase
    .from("job_applications")
    .select("*, open_positions(title, type, company_id, companies:company_id(name, slug))")
    .eq("applicant_company_id", user.companyId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ message: error.message }, { status: 500 });

  return Response.json(
    (data ?? []).map((a: any) => ({
      id: a.id, positionId: a.position_id, applicantCompanyId: a.applicant_company_id,
      applicantName: a.applicant_name, applicantEmail: a.applicant_email,
      message: a.message, status: a.status, createdAt: a.created_at,
      position: a.open_positions ? {
        title: a.open_positions.title, type: a.open_positions.type,
        company: a.open_positions.companies ? { name: a.open_positions.companies.name, slug: a.open_positions.companies.slug } : null,
      } : null,
    }))
  );
}
