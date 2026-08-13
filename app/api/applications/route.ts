import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { uploadCv, validateCvFile } from "@/lib/cv";

function mapApp(a: Record<string, unknown>) {
  return {
    id: a.id,
    positionId: a.position_id,
    applicantCompanyId: a.applicant_company_id,
    applicantName: a.applicant_name,
    applicantEmail: a.applicant_email,
    message: a.message,
    cvUrl: a.cv_url ?? null,
    hasCv: Boolean(a.cv_url),
    status: a.status,
    createdAt: a.created_at,
  };
}

async function parseApplicationBody(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const cvEntry = formData.get("cv");
    return {
      positionId: String(formData.get("positionId") || ""),
      applicantName: String(formData.get("applicantName") || ""),
      applicantEmail: String(formData.get("applicantEmail") || ""),
      message: String(formData.get("message") || ""),
      applicantCompanyId: String(formData.get("applicantCompanyId") || ""),
      cvFile: cvEntry instanceof File && cvEntry.size > 0 ? cvEntry : null,
    };
  }

  const body = await req.json();
  return {
    positionId: body.positionId as string,
    applicantName: body.applicantName as string,
    applicantEmail: body.applicantEmail as string,
    message: (body.message as string) || "",
    applicantCompanyId: (body.applicantCompanyId as string) || "",
    cvFile: null as File | null,
  };
}

export async function POST(req: NextRequest) {
  const { positionId, applicantName, applicantEmail, message, applicantCompanyId, cvFile } = await parseApplicationBody(req);

  if (!positionId || !applicantName || !applicantEmail) {
    return Response.json({ message: "Missing required fields" }, { status: 400 });
  }

  const { data: position } = await supabase
    .from("open_positions")
    .select("id, company_id, is_active, type")
    .eq("id", positionId)
    .single();

  if (!position || !position.is_active) {
    return Response.json({ message: "Position not found or closed" }, { status: 404 });
  }

  if (position.type === "HIRING") {
    if (!cvFile) return Response.json({ message: "CV is required for job applications" }, { status: 400 });
    const cvError = validateCvFile(cvFile);
    if (cvError) return Response.json({ message: cvError }, { status: 400 });
  }

  if (applicantCompanyId && applicantCompanyId === position.company_id) {
    return Response.json({ message: "Cannot apply to your own position" }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("job_applications")
    .select("id")
    .eq("position_id", positionId)
    .eq("applicant_email", applicantEmail)
    .single();

  if (existing) {
    return Response.json({ message: "You have already applied to this position" }, { status: 403 });
  }

  let cvPath: string | null = null;
  if (cvFile) {
    try {
      cvPath = await uploadCv(cvFile, positionId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to upload CV";
      return Response.json({ message: msg }, { status: 500 });
    }
  }

  const { data: app, error } = await supabase
    .from("job_applications")
    .insert({
      position_id: positionId,
      applicant_company_id: applicantCompanyId || null,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      message: message || null,
      cv_url: cvPath,
      status: "PENDING",
    })
    .select()
    .single();

  if (error) {
    if (cvPath) await supabase.storage.from("application-cvs").remove([cvPath]);
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json(mapApp(app), { status: 201 });
}
