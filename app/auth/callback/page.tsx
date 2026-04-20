"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Supabase redirects here after clicking the password reset email link.
// The token arrives in the URL hash (#access_token=...&type=recovery).
// The browser-side Supabase client picks it up automatically via onAuthStateChange.
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/update-password");
      } else if (event === "SIGNED_IN") {
        // Any other sign-in flow — go to dashboard
        router.replace("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Redirecting...</p>
    </div>
  );
}
