import { fetchApi } from "@/lib/api";

export interface Position {
  id: string;
  companyId: string;
  title: string;
  description: string;
  type: "HIRING" | "COLLABORATION";
  techStack: string[];
  isActive: boolean;
  createdAt: string;
  company?: {
    name: string;
    slug: string;
    industry: string;
    logo: string | null;
  };
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getPositions(): Promise<Position[]> {
  return fetchApi<Position[]>("/positions");
}

export async function getMyPositions(token: string): Promise<Position[]> {
  return fetchApi<Position[]>("/positions/mine", { headers: authHeaders(token) });
}

export async function createPosition(token: string, data: { title: string; description: string; type: string; techStack: string[] }) {
  return fetchApi<Position>("/positions", { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
}

export async function deletePosition(token: string, id: string) {
  return fetchApi(`/positions/${id}`, { method: "DELETE", headers: authHeaders(token) });
}
