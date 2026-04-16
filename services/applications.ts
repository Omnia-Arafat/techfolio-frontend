import { fetchApi } from "@/lib/api";

export interface Application {
  id: string;
  positionId: string;
  applicantCompanyId: string | null;
  applicantName: string;
  applicantEmail: string;
  message: string | null;
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
}) {
  return fetchApi<Application>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
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
