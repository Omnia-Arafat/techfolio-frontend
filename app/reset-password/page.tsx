"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/services/auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Reset Password</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-secondary)" }}>
            {sent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            {error && <p style={{ fontSize: 13, color: "#f87171", textAlign: "center", margin: 0 }}>{error}</p>}
            <button type="submit" className="btn-gradient" style={{ padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", color: "#fff", background: "linear-gradient(135deg, #7042f8, #00d1ff)" }}>
              Send Reset Link
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: 20, borderRadius: 14, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <p style={{ color: "#4ade80", fontSize: 14, margin: 0 }}>If the email exists, a reset link was sent.</p>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/login" style={{ fontSize: 13, color: "var(--accent-purple)", textDecoration: "none" }}>Back to login</Link>
        </div>
      </div>
    </div>
  );
}
