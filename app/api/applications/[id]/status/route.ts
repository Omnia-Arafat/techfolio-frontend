import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden, notFound } from "@/lib/auth-utils";
import { sendApplicationAccepted, sendApplicationRejected } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { id } = await params;
  const { status } = await req.json();

  const { data: app } = await supabase.from("job_applications").select("id, applicant_name, applicant_email, position_id").eq("id", id).single();
  if (!app) return notFound("Application not found");

  const { data: position } = await supabase.from("open_positions").select("company_id, title, type, companies:company_id(name)").eq("id", app.position_id).single();
  if (!position || position.company_id !== user.companyId) return forbidden("Not your position");

  const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
  if (error) return Response.json({ message: error.message }, { status: 500 });

  // Fire-and-forget email
  const companyName = (position as any).companies?.name || "The company";
  const { data: ownerUser } = await supabase.from("users").select("email").eq("company_id", user.companyId).single();

  if (ownerUser) {
    const emailData = { to: ownerUser.email, applicantName: app.applicant_name, applicantEmail: app.applicant_email, positionTitle: position.title, companyName, isCollaboration: position.type === "COLLABORATION" };
    if (status === "ACCEPTED") sendApplicationAccepted(emailData).catch(() => {});
    else sendApplicationRejected(emailData).catch(() => {});
  }

  return Response.json({ success: true });
}
