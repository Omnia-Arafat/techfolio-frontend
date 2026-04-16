import { fetchApi } from "@/lib/api";

export async function resetPassword(email: string) {
  return fetchApi<{ success: boolean; message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function updatePassword(token: string, password: string) {
  return fetchApi<{ success: boolean }>("/auth/update-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password }),
  });
}
