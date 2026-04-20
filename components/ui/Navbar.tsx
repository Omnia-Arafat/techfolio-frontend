"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon, Menu, X } from "lucide-react";

const linkStyle = (isActive: boolean) => ({
  padding: "8px 14px",
  borderRadius: "8px",
  fontSize: "13px" as const,
  fontWeight: 500 as const,
  textDecoration: "none" as const,
  color: isActive ? "var(--accent-purple)" : "var(--text-secondary)",
  background: isActive ? "var(--accent-purple-bg)" : "transparent",
  border: isActive ? "1px solid var(--accent-purple-border)" : "1px solid transparent",
  transition: "all 0.2s ease",
  display: "block",
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, isCompany, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
    setMenuOpen(false);
  };

  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="nav-logo" onClick={close}>TechFolio</Link>

        {/* Desktop links */}
        <div className="nav-links">
          <Link href="/" style={linkStyle(pathname === "/")}>Companies</Link>
          <Link href="/positions" style={linkStyle(pathname === "/positions")}>Jobs & Collabs</Link>
          {!loading && !user && (
            <>
              <Link href="/register" style={linkStyle(pathname === "/register")}>List Your Company</Link>
              <Link href="/login" style={linkStyle(pathname === "/login")}>Sign In</Link>
            </>
          )}
          {isCompany && <Link href="/dashboard" style={linkStyle(pathname === "/dashboard")}>My Company</Link>}
          {isAdmin && <Link href="/admin" style={linkStyle(pathname === "/admin")}>Admin Panel</Link>}
          <button onClick={toggleTheme} className="theme-btn" title={isDark ? "Light mode" : "Dark mode"}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {user && (
            <button onClick={handleLogout} className="signout-btn">Sign Out</button>
          )}
        </div>

        {/* Mobile right side */}
        <div className="nav-mobile-right">
          <button onClick={toggleTheme} className="theme-btn" title={isDark ? "Light mode" : "Dark mode"}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={() => setMenuOpen((v) => !v)} className="hamburger-btn" aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/" style={linkStyle(pathname === "/")} onClick={close}>Companies</Link>
          <Link href="/positions" style={linkStyle(pathname === "/positions")} onClick={close}>Jobs & Collabs</Link>
          {!loading && !user && (
            <>
              <Link href="/register" style={linkStyle(pathname === "/register")} onClick={close}>List Your Company</Link>
              <Link href="/login" style={linkStyle(pathname === "/login")} onClick={close}>Sign In</Link>
            </>
          )}
          {isCompany && <Link href="/dashboard" style={linkStyle(pathname === "/dashboard")} onClick={close}>My Company</Link>}
          {isAdmin && <Link href="/admin" style={linkStyle(pathname === "/admin")} onClick={close}>Admin Panel</Link>}
          {user && (
            <button onClick={handleLogout} className="signout-btn" style={{ width: "100%", textAlign: "left" }}>Sign Out</button>
          )}
        </div>
      )}
    </nav>
  );
}
