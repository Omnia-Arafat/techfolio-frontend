"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/sections/Hero";
import CompanyCard from "@/components/ui/CompanyCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { getApprovedCompanies } from "@/services/company";
import { Building2 } from "lucide-react";
import type { Company } from "@/types";

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedCompanies()
      .then(setCompanies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />

      {/* Directory Section */}
      <section id="directory" style={{ position: "relative", padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          {/* Section header */}
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
              Company{" "}
              <span className="section-title-accent">Directory</span>
            </h2>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)" }}>
              Approved startups in our incubator
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }} className="stagger">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : companies.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 32, borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" }}>
                <Building2 size={32} style={{ color: "var(--accent-purple)" }} />
                <p style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: 14, margin: 0 }}>No companies yet</p>
                <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>Be the first to register your startup!</p>
              </div>
            </div>
          ) : (
            <div
              className="stagger"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  id={company.id}
                  name={company.name}
                  bio={company.bio}
                  industry={company.industry}
                  techStack={company.techStack}
                  slug={company.slug}
                  logo={company.logo}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
