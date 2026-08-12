"use client";

import { useEffect, useState } from "react";
import { getPositions } from "@/services/positions";
import { getApprovedCompanies } from "@/services/company";
import type { Position } from "@/services/positions";
import type { Company } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, Search } from "lucide-react";
import { SkeletonList } from "@/components/ui/Skeleton";
import PositionCard from "@/components/ui/PositionCard";
import ApplyModal from "@/components/ui/ApplyModal";

const card = { borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" };
const inp = { background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-primary)", borderRadius: 10, padding: "9px 13px", width: "100%", outline: "none", fontSize: 14 };

export default function PositionsPage() {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "HIRING" | "COLLABORATION">("ALL");
  const [search, setSearch] = useState("");
  const [applyTarget, setApplyTarget] = useState<Position | null>(null);

  useEffect(() => {
    Promise.all([getPositions(), getApprovedCompanies()])
      .then(([pos, cos]) => {
        setPositions(pos);
        setCompanies(cos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openApply = (pos: Position) => setApplyTarget(pos);

  const getApplyInitialForm = () => {
    if (user?.role !== "COMPANY") return undefined;
    const myCompany = companies.find((c) => c.id === user.companyId);
    return {
      applicantName: myCompany?.name || "",
      applicantEmail: user.email || "",
      message: "",
      applicantCompanyId: user.companyId || "",
    };
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
            {filtered.map((pos) => (
              <PositionCard
                key={pos.id}
                position={pos}
                onApply={openApply}
                showCompany
                isMine={isMyPosition(pos)}
              />
            ))}
          </div>
        )}
      </div>

      {applyTarget && (
        <ApplyModal
          position={applyTarget}
          onClose={() => setApplyTarget(null)}
          initialForm={getApplyInitialForm()}
          isCompanyUser={user?.role === "COMPANY"}
        />
      )}
    </div>
  );
}
