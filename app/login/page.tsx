"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const saved = localStorage.getItem("techfolio_auth");
      const role = saved ? JSON.parse(saved).user.role : null;
      router.push(role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Welcome back</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-secondary)" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">Email</label>
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
          </div>

          {error && <p style={{ fontSize: 13, color: "#f87171", textAlign: "center", margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", color: "var(--text-primary)", background: "linear-gradient(135deg, #7042f8, #00d1ff)", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href="/reset-password" style={{ fontSize: 13, color: "var(--accent-purple)", textDecoration: "none" }}>Forgot password?</Link>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>List your company</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
