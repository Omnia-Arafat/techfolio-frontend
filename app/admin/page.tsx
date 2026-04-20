"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllCompanies, approveCompany, rejectCompany, deleteCompany } from "@/services/company";
import { Building2, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import type { Company } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { SkeletonAdminCard, Skeleton } from "@/components/ui/Skeleton";

const statusMap: Record<string, { bg: string; border: string; text: string; label: string }> = {
  PENDING:  { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24", label: "Pending" },
  APPROVED: { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   text: "#4ade80", label: "Approved" },
  REJECTED: { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   text: "#f87171", label: "Rejected" },
};

const card = { borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" };

export default function AdminPage() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadCompanies = useCallback(() => {
    if (!token) return;
    setLoadingData(true);
    setFetchError(null);
    getAllCompanies(token)
      .then(setCompanies)
      .catch((err) => setFetchError(err instanceof Error ? err.message : "Failed to load companies"))
      .finally(() => setLoadingData(false));
  }, [token]);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    await approveCompany(id, token);
    loadCompanies();
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    await rejectCompany(id, token);
    loadCompanies();
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    setConfirmDelete(null);
    await deleteCompany(id, token);
    loadCompanies();
    setActionLoading(null);
  };

  const pending = companies.filter((c) => c.status === "PENDING");
  const approved = companies.filter((c) => c.status === "APPROVED");
  const rejected = companies.filter((c) => c.status === "REJECTED");

  return (
    <div style={{ minHeight: "100vh", width: "100%", padding: "100px 24px 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
            Company{" "}
            <span className="accent-text">Approvals</span>
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "var(--text-muted)" }}>Review and manage company registrations</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
          {loadingData ? (
            [1,2,3].map(i => (
              <div key={i} style={{ ...card, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <Skeleton width={22} height={22} borderRadius={6} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Skeleton width={40} height={22} borderRadius={6} />
                  <Skeleton width={60} height={12} borderRadius={4} />
                </div>
              </div>
            ))
          ) : (
            [{label:"Pending",count:pending.length,Icon:Clock,color:"#fbbf24"},{label:"Approved",count:approved.length,Icon:CheckCircle2,color:"#4ade80"},{label:"Rejected",count:rejected.length,Icon:XCircle,color:"#f87171"}].map(({ label, count, Icon, color }) => (
              <div key={label} style={{ ...card, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <Icon size={22} style={{ color }} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{count}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Company list */}
        {loadingData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="stagger">
            {[1,2,3,4].map(i => <SkeletonAdminCard key={i} />)}
          </div>
        ) : fetchError ? (
          <div style={{ ...card, padding: "40px 20px", textAlign: "center" }}>
            <p style={{ color: "#f87171", fontSize: 14, margin: 0 }}>Error: {fetchError}</p>
            <button onClick={loadCompanies} style={{ marginTop: 12, padding: "7px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-secondary)" }}>Retry</button>
          </div>
        ) : companies.length === 0 ? (
          <div style={{ ...card, padding: "60px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Building2 size={32} style={{ color: "rgba(112,66,248,0.4)" }} />
            <p style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 14, margin: 0 }}>No registrations yet</p>
          </div>
        ) : (
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {companies.map((company) => {
              const s = statusMap[company.status];
              return (
                <div key={company.id} style={{ ...card, padding: "22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>

                    {/* Left: info */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "linear-gradient(135deg, #7042f8, #00d1ff)" }}>
                        <Building2 size={18} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + status */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <h3 style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 16, margin: 0 }}>{company.name}</h3>
                          <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 5, background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                            {s.label}
                          </span>
                        </div>
                        {/* Bio */}
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {company.bio}
                        </p>
                        {/* Tags */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(112,66,248,0.1)", color: "var(--accent-purple)" }}>{company.industry}</span>
                          {company.techStack.slice(0, 3).map((t) => (
                            <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(0,209,255,0.06)", color: "var(--accent-cyan)" }}>{t}</span>
                          ))}
                        </div>
                        {/* Meta */}
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                          {company.teamMembers.length} member{company.teamMembers.length !== 1 ? "s" : ""} | {company.projects.length} project{company.projects.length !== 1 ? "s" : ""} | {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      {company.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(company.id)}
                            disabled={actionLoading === company.id}
                            style={{
                              display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8,
                              fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(34,197,94,0.35)",
                              background: "rgba(34,197,94,0.12)", color: "#4ade80",
                              opacity: actionLoading === company.id ? 0.5 : 1, transition: "opacity 0.15s",
                            }}
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(company.id)}
                            disabled={actionLoading === company.id}
                            style={{
                              display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8,
                              fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(239,68,68,0.3)",
                              background: "rgba(239,68,68,0.08)", color: "#f87171",
                              opacity: actionLoading === company.id ? 0.5 : 1, transition: "opacity 0.15s",
                            }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(company.id)}
                        disabled={actionLoading === company.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8,
                          fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(239,68,68,0.2)",
                          background: "rgba(239,68,68,0.06)", color: "#f87171",
                          opacity: actionLoading === company.id ? 0.5 : 1, transition: "opacity 0.15s",
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirm delete dialog */}
        {confirmDelete && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div style={{ borderRadius: 16, padding: "28px 32px", background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.25)", maxWidth: 380, width: "90%", textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>Delete Company?</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>This will permanently delete the company, its team, projects, positions, and auth user. This cannot be undone.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => handleDelete(confirmDelete)} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "rgba(239,68,68,0.85)", color: "#fff" }}>Yes, Delete</button>
                <button onClick={() => setConfirmDelete(null)} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-secondary)" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
