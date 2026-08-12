"use client";

import Link from "next/link";
import { Briefcase, Building2, Handshake, Send } from "lucide-react";
import type { Position } from "@/services/positions";

const card = { borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" };

const typeConfig = {
  HIRING: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", text: "#4ade80", Icon: Briefcase, label: "Hiring" },
  COLLABORATION: { bg: "rgba(112,66,248,0.1)", border: "rgba(112,66,248,0.25)", text: "var(--accent-purple)", Icon: Handshake, label: "Collaboration" },
};

interface PositionCardProps {
  position: Position;
  onApply?: (position: Position) => void;
  showCompany?: boolean;
  isMine?: boolean;
}

export default function PositionCard({ position, onApply, showCompany = true, isMine = false }: PositionCardProps) {
  const tc = typeConfig[position.type];
  const TypeIcon = tc.Icon;

  return (
    <div style={{ ...card, padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <h3 style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 15, margin: 0 }}>{position.title}</h3>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 5, background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text }}>
              <TypeIcon size={10} /> {tc.label}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>{position.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {position.techStack.map((t) => (
              <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(0,209,255,0.07)", border: "1px solid rgba(0,209,255,0.15)", color: "var(--accent-cyan)" }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
          {showCompany && position.company && (
            <Link href={`/company/${position.company.slug}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)", textDecoration: "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#7042f8,#00d1ff)" }}>
                <Building2 size={13} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{position.company.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{position.company.industry}</p>
              </div>
            </Link>
          )}
          {!isMine && onApply && (
            <button onClick={() => onApply(position)} className="btn-gradient" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
              background: position.type === "COLLABORATION" ? "linear-gradient(135deg,#7042f8,#a78bfa)" : "linear-gradient(135deg,#7042f8,#00d1ff)",
              color: "#fff",
            }}>
              {position.type === "COLLABORATION" ? <><Handshake size={13} /> Connect</> : <><Send size={13} /> Apply</>}
            </button>
          )}
          {isMine && (
            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(112,66,248,0.1)", border: "1px solid rgba(112,66,248,0.2)", color: "var(--accent-purple)" }}>Your post</span>
          )}
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
        Posted {new Date(position.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
