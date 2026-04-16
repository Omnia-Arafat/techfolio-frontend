import { fetchApi } from "@/lib/api";
import type { Company, RegisterCompanyInput } from "@/types";

export async function getApprovedCompanies(): Promise<Company[]> {
  return fetchApi<Company[]>("/companies/approved");
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    return await fetchApi<Company>(`/companies/${slug}`);
  } catch {
    return null;
  }
}

export async function registerCompany(
  data: RegisterCompanyInput
): Promise<{ success: boolean; companyId?: string; email?: string; generatedPassword?: string; error?: string }> {
  try {
    const result = await fetchApi<{ id: string; email: string; generatedPassword: string }>("/companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return { success: true, companyId: result.id, email: result.email, generatedPassword: result.generatedPassword };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function getAllCompanies(token: string): Promise<Company[]> {
  return fetchApi<Company[]>("/admin/companies", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function approveCompany(
  id: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchApi(`/admin/companies/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function rejectCompany(
  id: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchApi(`/admin/companies/${id}/reject`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export async function deleteCompany(
  id: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchApi(`/admin/companies/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
