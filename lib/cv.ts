import * as crypto from "crypto";
import { supabase } from "@/lib/supabase";

const MAX_CV_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_CV_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

export function validateCvFile(file: File): string | null {
  if (file.size > MAX_CV_SIZE) return "CV must be 5MB or smaller";
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_CV_EXTENSIONS.has(ext)) return "CV must be a PDF, DOC, or DOCX file";
  if (file.type && !ALLOWED_CV_TYPES.has(file.type)) {
    // Some browsers omit MIME type; extension check above is the fallback.
    if (file.type !== "application/octet-stream") return "CV must be a PDF, DOC, or DOCX file";
  }
  return null;
}

export async function uploadCv(file: File, positionId: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${positionId}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("application-cvs")
    .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: false });

  if (error) throw new Error(error.message);
  return path;
}

export async function getCvSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from("application-cvs").createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) throw new Error(error?.message || "Could not generate CV download link");
  return data.signedUrl;
}
