"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";
import { getPositions } from "@/services/positions";
import { getApprovedCompanies } from "@/services/company";
import { useAuth } from "@/lib/auth-context";
import type { Position } from "@/services/positions";
import type { Company } from "@/types";
import PositionCard from "@/components/ui/PositionCard";
import ApplyModal from "@/components/ui/ApplyModal";
import { SkeletonList } from "@/components/ui/Skeleton";

export default function HiringSection() {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyTarget, setApplyTarget] = useState<Position | null>(null);

  useEffect(() => {
    Promise.all([getPositions(), getApprovedCompanies()])
      .then(([pos, cos]) => {
        setPositions(pos.filter((p) => p.type === "HIRING"));
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

  const isMyPosition = (pos: Position) => user?.role === "COMPANY" && user.companyId === pos.companyId;
  const featured = positions.slice(0, 6);

  return (
    <>
      <section id="jobs" style={{ position: "relative", padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
              Open{" "}
              <span className="section-title-accent">Positions</span>
            </h2>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)" }}>
              Hiring opportunities from incubator companies — apply directly
            </p>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : featured.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 32, borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" }}>
                <Briefcase size={32} style={{ color: "var(--accent-purple)" }} />
                <p style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 14, margin: 0 }}>No open positions yet</p>
                <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>Check back soon for hiring opportunities</p>
              </div>
            </div>
          ) : (
            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {featured.map((pos) => (
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

          {positions.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link href="/positions" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--bg-card-border)", color: "var(--text-secondary)" }}>
                View All Jobs & Collabs <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {applyTarget && (
        <ApplyModal
          position={applyTarget}
          onClose={() => setApplyTarget(null)}
          initialForm={getApplyInitialForm()}
          isCompanyUser={user?.role === "COMPANY"}
        />
      )}
    </>
  );
}
