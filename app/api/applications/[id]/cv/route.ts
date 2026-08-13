import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden, notFound } from "@/lib/auth-utils";
import { getCvSignedUrl } from "@/lib/cv";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { id } = await params;

  const { data: app } = await supabase
    .from("job_applications")
    .select("cv_url, position_id, open_positions(company_id)")
    .eq("id", id)
    .single();

  if (!app) return notFound("Application not found");
  if (!app.cv_url) return notFound("No CV attached");

  const companyId = (app as any).open_positions?.company_id;
  if (companyId !== user.companyId) return forbidden("Not your application");

  try {
    const signedUrl = await getCvSignedUrl(app.cv_url);
    return Response.json({ url: signedUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load CV";
    return Response.json({ message }, { status: 500 });
  }
}
