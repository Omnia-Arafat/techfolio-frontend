"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

const linkStyle = (isActive: boolean) => ({
  padding: "7px 16px",
  borderRadius: "8px",
  fontSize: "13px" as const,
  fontWeight: 500 as const,
  textDecoration: "none" as const,
  color: isActive ? "var(--accent-purple)" : "var(--text-secondary)",
  background: isActive ? "var(--accent-purple-bg)" : "transparent",
  border: isActive ? "1px solid var(--accent-purple-border)" : "1px solid transparent",
  transition: "all 0.2s ease",
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, isCompany, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: "16px 28px",
      background: "var(--bg-nav)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderBottom: "1px solid var(--bg-nav-border)",
      transition: "background 0.3s ease, border-color 0.3s ease",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" className="nav-logo">
          TechFolio
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/" style={linkStyle(pathname === "/")}>Companies</Link>
          <Link href="/positions" style={linkStyle(pathname === "/positions")}>Jobs & Collabs</Link>

          {!loading && !user && (
            <>
              <Link href="/register" style={linkStyle(pathname === "/register")}>List Your Company</Link>
              <Link href="/login" style={linkStyle(pathname === "/login")}>Sign In</Link>
            </>
          )}

          {isCompany && (
            <Link href="/dashboard" style={linkStyle(pathname === "/dashboard")}>My Company</Link>
          )}

          {isAdmin && (
            <Link href="/admin" style={linkStyle(pathname === "/admin")}>Admin Panel</Link>
          )}

          {/* Theme toggle */}
          <button onClick={toggleTheme} title={isDark ? "Switch to light mode" : "Switch to dark mode"} style={{
            padding: "7px 10px", borderRadius: 8, cursor: "pointer",
            background: "var(--accent-purple-bg)",
            border: "1px solid var(--accent-purple-border)",
            color: "var(--accent-purple)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {user && (
            <button onClick={handleLogout} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)",
              color: "#f87171", cursor: "pointer", transition: "all 0.2s",
            }}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
