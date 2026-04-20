"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Dynamically import to avoid SSR — env vars only available client-side
    import("@/lib/supabase-browser").then(({ supabaseBrowser }) => {
      const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          router.replace("/update-password");
        } else if (event === "SIGNED_IN") {
          router.replace("/dashboard");
        }
      });

      return () => subscription.unsubscribe();
    });
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Redirecting...</p>
    </div>
  );
}
