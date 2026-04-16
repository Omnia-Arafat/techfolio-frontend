import { fetchApi } from "@/lib/api";
import type { Company } from "@/types";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getMyCompany(token: string): Promise<Company> {
  return fetchApi<Company>("/dashboard/me", { headers: authHeaders(token) });
}

export async function updateMyCompany(token: string, data: { name?: string; bio?: string; industry?: string; techStack?: string[]; website?: string }) {
  return fetchApi("/dashboard/me", { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
}

export async function addTeamMember(token: string, data: { name: string; role: string; linkedin?: string }) {
  return fetchApi("/dashboard/me/team", { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
}

export async function removeTeamMember(token: string, memberId: string) {
  return fetchApi(`/dashboard/me/team/${memberId}`, { method: "DELETE", headers: authHeaders(token) });
}

export async function addProject(token: string, data: { title: string; description: string; techStack: string[]; url?: string }) {
  return fetchApi("/dashboard/me/projects", { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
}

export async function removeProject(token: string, projectId: string) {
  return fetchApi(`/dashboard/me/projects/${projectId}`, { method: "DELETE", headers: authHeaders(token) });
}
