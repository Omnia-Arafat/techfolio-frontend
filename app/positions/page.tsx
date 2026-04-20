"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPositions } from "@/services/positions";
import { applyToPosition } from "@/services/applications";
import { getApprovedCompanies } from "@/services/company";
import type { Position } from "@/services/positions";
import type { Company } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, Users, Search, Building2, X, Check, Send, Handshake } from "lucide-react";
import { SkeletonList } from "@/components/ui/Skeleton";

const card = { borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" };
const inp = { background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-primary)", borderRadius: 10, padding: "9px 13px", width: "100%", outline: "none", fontSize: 14 };
const lbl = { color: "var(--text-secondary)", fontSize: 12, fontWeight: 500 as const, display: "block" as const, marginBottom: 5 };

const typeConfig = {
  HIRING: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", text: "#4ade80", Icon: Briefcase, label: "Hiring" },
  COLLABORATION: { bg: "rgba(112,66,248,0.1)", border: "rgba(112,66,248,0.25)", text: "var(--accent-purple)", Icon: Handshake, label: "Collaboration" },
};

const statusColors = {
  PENDING:  { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24", label: "Pending" },
  ACCEPTED: { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   text: "#4ade80", label: "Accepted" },
  REJECTED: { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   text: "#f87171", label: "Rejected" },
};

interface ApplyForm {
  applicantName: string;
  applicantEmail: string;
  message: string;
  applicantCompanyId: string;
}

export default function PositionsPage() {
  const { user, token } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "HIRING" | "COLLABORATION">("ALL");
  const [search, setSearch] = useState("");

  // Apply modal
  const [applyTarget, setApplyTarget] = useState<Position | null>(null);
  const [applyForm, setApplyForm] = useState<ApplyForm>({ applicantName: "", applicantEmail: "", message: "", applicantCompanyId: "" });
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    Promise.all([
      getPositions(),
      getApprovedCompanies(),
    ]).then(([pos, cos]) => {
      setPositions(pos);
      setCompanies(cos);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openApply = (pos: Position) => {
    setApplyTarget(pos);
    setApplyResult(null);
    // Pre-fill if logged in as company
    if (user?.role === "COMPANY") {
      const myCompany = companies.find(c => c.id === user.companyId);
      setApplyForm({
        applicantName: myCompany?.name || "",
        applicantEmail: user.email || "",
        message: "",
        applicantCompanyId: user.companyId || "",
      });
    } else {
      setApplyForm({ applicantName: "", applicantEmail: "", message: "", applicantCompanyId: "" });
    }
  };

  const handleApply = async () => {
    if (!applyTarget || !applyForm.applicantName || !applyForm.applicantEmail) return;
    setApplying(true);
    try {
      await applyToPosition({
        positionId: applyTarget.id,
        applicantName: applyForm.applicantName,
        applicantEmail: applyForm.applicantEmail,
        message: applyForm.message || undefined,
        applicantCompanyId: applyForm.applicantCompanyId || undefined,
      });
      setApplyResult({ success: true, message: applyTarget.type === "COLLABORATION" ? "Collaboration request sent!" : "Application submitted!" });
    } catch (e) {
      setApplyResult({ success: false, message: e instanceof Error ? e.message : "Failed to submit" });
    }
    setApplying(false);
  };

  const filtered = positions.filter((p) => {
    if (filter !== "ALL" && p.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q)) || p.company?.name.toLowerCase().includes(q);
    }
    return true;
  });

  const isMyPosition = (pos: Position) => user?.role === "COMPANY" && user.companyId === pos.companyId;

  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
            Jobs &{" "}
            <span className="accent-text">Collabs</span>
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-secondary)" }}>Hiring opportunities and collaboration requests from incubator companies</p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search positions, tech, companies..."
              style={{ ...inp, padding: "9px 13px 9px 34px" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["ALL", "HIRING", "COLLABORATION"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
                background: filter === f ? "var(--accent-purple-bg)" : "var(--bg-card)",
                border: filter === f ? "1px solid rgba(112,66,248,0.35)" : "1px solid var(--bg-card-border)",
                color: filter === f ? "var(--accent-purple)" : "var(--text-secondary)",
              }}>{f === "ALL" ? "All" : f === "HIRING" ? "Hiring" : "Collaboration"}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonList count={4} />
        ) : filtered.length === 0 ? (
          <div style={{ ...card, padding: "60px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Briefcase size={32} style={{ color: "rgba(112,66,248,0.4)" }} />
            <p style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 14, margin: 0 }}>No positions found</p>
          </div>
        ) : (
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((pos) => {
              const tc = typeConfig[pos.type];
              const TypeIcon = tc.Icon;
              const mine = isMyPosition(pos);
              return (
                <div key={pos.id} style={{ ...card, padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <h3 style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 15, margin: 0 }}>{pos.title}</h3>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 5, background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text }}>
                          <TypeIcon size={10} /> {tc.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>{pos.description}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {pos.techStack.map((t) => <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(0,209,255,0.07)", border: "1px solid rgba(0,209,255,0.15)", color: "var(--accent-cyan)" }}>{t}</span>)}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                      {pos.company && (
                        <Link href={`/company/${pos.company.slug}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)", textDecoration: "none" }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#7042f8,#00d1ff)" }}>
                            <Building2 size={13} color="#fff" />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{pos.company.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{pos.company.industry}</p>
                          </div>
                        </Link>
                      )}
                      {!mine && (
                        <button onClick={() => openApply(pos)} className="btn-gradient" style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8,
                          fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                          background: pos.type === "COLLABORATION" ? "linear-gradient(135deg,#7042f8,#a78bfa)" : "linear-gradient(135deg,#7042f8,#00d1ff)",
                          color: "#fff",
                        }}>
                          {pos.type === "COLLABORATION" ? <><Handshake size={13} /> Connect</> : <><Send size={13} /> Apply</>}
                        </button>
                      )}
                      {mine && (
                        <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(112,66,248,0.1)", border: "1px solid rgba(112,66,248,0.2)", color: "var(--accent-purple)" }}>Your post</span>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
                    Posted {new Date(pos.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply / Connect Modal */}
      {applyTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 480, borderRadius: 16, padding: "28px", background: "var(--bg-card)", border: "1px solid var(--bg-input-border)" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {applyTarget.type === "COLLABORATION" ? "Collaboration Request" : "Job Application"}
                </p>
                <h3 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{applyTarget.title}</h3>
                {applyTarget.company && <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>{applyTarget.company.name}</p>}
              </div>
              <button onClick={() => setApplyTarget(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {applyResult ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", background: applyResult.success ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: applyResult.success ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)" }}>
                  {applyResult.success ? <Check size={24} color="#4ade80" /> : <X size={24} color="#f87171" />}
                </div>
                <p style={{ color: applyResult.success ? "#4ade80" : "#f87171", fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>{applyResult.message}</p>
                {applyResult.success && <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>The company will review and respond to your request.</p>}
                <button onClick={() => setApplyTarget(null)} style={{ marginTop: 20, padding: "8px 24px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-secondary)" }}>Close</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Company selector for logged-in company users */}
                {user?.role === "COMPANY" && (
                  <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(112,66,248,0.08)", border: "1px solid rgba(112,66,248,0.2)" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--accent-purple)" }}>
                      {applyTarget.type === "COLLABORATION"
                        ? "Sending as your company - the other company will see your profile."
                        : "Applying as your company - your company profile will be shared."}
                    </p>
                  </div>
                )}

                <div>
                  <label style={lbl}>{applyTarget.type === "COLLABORATION" ? "Your Company / Name *" : "Your Name *"}</label>
                  <input style={inp} placeholder="Name" value={applyForm.applicantName} onChange={(e) => setApplyForm({ ...applyForm, applicantName: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>Email *</label>
                  <input style={inp} type="email" placeholder="contact@company.com" value={applyForm.applicantEmail} onChange={(e) => setApplyForm({ ...applyForm, applicantEmail: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>{applyTarget.type === "COLLABORATION" ? "Why do you want to collaborate? (optional)" : "Cover message (optional)"}</label>
                  <textarea rows={3} style={{ ...inp, resize: "vertical" }} placeholder={applyTarget.type === "COLLABORATION" ? "Describe the collaboration opportunity..." : "Tell them why you're a great fit..."} value={applyForm.message} onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })} />
                </div>

                <button onClick={handleApply} disabled={applying || !applyForm.applicantName || !applyForm.applicantEmail} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", border: "none", color: "var(--text-primary)",
                  background: applyTarget.type === "COLLABORATION" ? "linear-gradient(135deg,#7042f8,#a78bfa)" : "linear-gradient(135deg,#7042f8,#00d1ff)",
                  opacity: applying || !applyForm.applicantName || !applyForm.applicantEmail ? 0.5 : 1,
                }}>
                  {applying ? "Sending..." : applyTarget.type === "COLLABORATION" ? <><Handshake size={14} /> Send Collaboration Request</> : <><Send size={14} /> Submit Application</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
