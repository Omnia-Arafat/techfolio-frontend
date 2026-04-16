"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";

export interface CompanyCardProps {
  id: string;
  name: string;
  bio: string;
  industry: string;
  techStack: string[];
  slug: string;
  logo?: string | null;
}

export default function CompanyCard({ name, bio, industry, techStack, slug, logo }: CompanyCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/company/${slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div
        className="card-hover"
        style={{
          height: "100%", borderRadius: 14, padding: 22,
          display: "flex", flexDirection: "column", gap: 14,
          background: "var(--bg-card)",
          border: hovered ? "1px solid var(--accent-purple-border)" : "1px solid var(--bg-card-border)",
        }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={name} style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))" }}>
                <Building2 size={18} color="#fff" />
              </div>
            )}
            <div>
              <h3 style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 15, lineHeight: 1.3, margin: 0 }}>{name}</h3>
              <span style={{ display: "inline-block", marginTop: 4, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4, background: "var(--accent-purple-bg)", color: "var(--accent-purple)" }}>
                {industry}
              </span>
            </div>
          </div>
          <ArrowUpRight size={16} style={{ flexShrink: 0, color: "var(--accent-cyan)", opacity: hovered ? 1 : 0, transition: "opacity 0.2s ease", marginTop: 2 }} />
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {bio}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto", paddingTop: 4 }}>
          {techStack.slice(0, 4).map((tech) => (
            <span key={tech} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: "rgba(0,209,255,0.07)", border: "1px solid rgba(0,209,255,0.15)", color: "var(--accent-cyan)" }}>
              {tech}
            </span>
          ))}
          {techStack.length > 4 && (
            <span style={{ fontSize: 11, padding: "3px 8px", color: "var(--text-muted)" }}>+{techStack.length - 4}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
