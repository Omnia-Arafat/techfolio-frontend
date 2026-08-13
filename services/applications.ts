import { fetchApi } from "@/lib/api";

export interface Application {
  id: string;
  positionId: string;
  applicantCompanyId: string | null;
  applicantName: string;
  applicantEmail: string;
  message: string | null;
  cvUrl?: string | null;
  hasCv?: boolean;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  applicantCompany?: { name: string; slug: string; industry: string } | null;
  position?: {
    title: string;
    type: string;
    company: { name: string; slug: string } | null;
  } | null;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function applyToPosition(data: {
  positionId: string;
  applicantName: string;
  applicantEmail: string;
  message?: string;
  applicantCompanyId?: string;
  cv?: File;
}) {
  const { cv, ...fields } = data;

  if (cv) {
    const form = new FormData();
    form.append("positionId", fields.positionId);
    form.append("applicantName", fields.applicantName);
    form.append("applicantEmail", fields.applicantEmail);
    if (fields.message) form.append("message", fields.message);
    if (fields.applicantCompanyId) form.append("applicantCompanyId", fields.applicantCompanyId);
    form.append("cv", cv);
    return fetchApi<Application>("/applications", { method: "POST", body: form });
  }

  return fetchApi<Application>("/applications", {
    method: "POST",
    body: JSON.stringify(fields),
  });
}

export async function getApplicationCvDownloadUrl(token: string, applicationId: string) {
  return fetchApi<{ url: string }>(`/applications/${applicationId}/cv`, {
    headers: authHeaders(token),
  });
}

export async function getApplicationsForPosition(token: string, positionId: string) {
  return fetchApi<Application[]>(`/applications/position/${positionId}`, {
    headers: authHeaders(token),
  });
}

export async function getMyApplications(token: string) {
  return fetchApi<Application[]>("/applications/mine", {
    headers: authHeaders(token),
  });
}

export async function updateApplicationStatus(token: string, id: string, status: "ACCEPTED" | "REJECTED") {
  return fetchApi(`/applications/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
}
