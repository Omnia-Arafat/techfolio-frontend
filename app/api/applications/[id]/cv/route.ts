import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserFromRequest, unauthorized, forbidden, notFound } from "@/lib/auth-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== "COMPANY") return forbidden();

  const { id } = await params;

  const { data: app, error: appError } = await supabase
    .from("job_applications")
    .select("id, cv_url, position_id")
    .eq("id", id)
    .single();

  if (appError || !app) return notFound("Application not found");
  if (!app.cv_url) return notFound("No CV attached");

  const { data: position } = await supabase
    .from("open_positions")
    .select("company_id")
    .eq("id", app.position_id)
    .single();

  if (!position || position.company_id !== user.companyId) {
    return forbidden("Not your application");
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from("application-cvs")
    .download(app.cv_url);

  if (downloadError || !file) {
    return Response.json({ message: downloadError?.message || "Failed to download CV" }, { status: 500 });
  }

  const ext = app.cv_url.split(".").pop()?.toLowerCase() || "pdf";
  const contentTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return new Response(file, {
    headers: {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Content-Disposition": `attachment; filename="application-${id}.${ext}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
