"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { getCompanyBySlug } from "@/services/company";
import { Building2, Globe, ArrowLeft, ExternalLink, FolderGit2 } from "lucide-react";
import type { Company } from "@/types";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name: string) {
  const colors = [["#7042f8","#00d1ff"],["#f97316","#facc15"],["#ec4899","#a78bfa"],["#10b981","#06b6d4"],["#6366f1","#ec4899"],["#14b8a6","#3b82f6"]];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function CompanyProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getCompanyBySlug(slug).then((data) => { setCompany(data); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Skeleton width={120} height={16} borderRadius={6} style={{ marginBottom: 28 }} />
        <div className="card company-hero-card" style={{ marginBottom: 24 }}>
          <div className="company-hero-header" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <Skeleton width={72} height={72} borderRadius={16} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <Skeleton width="50%" height={28} borderRadius={8} />
              <Skeleton width="90%" height={14} />
              <Skeleton width="75%" height={14} />
            </div>
          </div>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[80,60,70,90,65].map((w,i) => <Skeleton key={i} width={w} height={26} borderRadius={6} />)}
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <Skeleton width={80} height={20} borderRadius={6} style={{ marginBottom: 16 }} />
          <div className="team-grid">
            {[1,2,3].map(i => (
              <div key={i} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
                <Skeleton width={44} height={44} borderRadius={22} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="40%" height={11} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <SkeletonCard />
      </div>
    </div>
  );

  if (!company || company.status !== "APPROVED") notFound();

  const divider = { borderTop: "1px solid var(--bg-card-border)", marginTop: 20, paddingTop: 20 };

  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <Link href="/#directory" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", textDecoration: "none", marginBottom: 28 }}>
          <ArrowLeft size={14} /> Back to Directory
        </Link>

        {/* Hero card */}
        <div className="card company-hero-card" style={{ marginBottom: 24 }}>
          <div className="company-hero-header" style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
            {company!.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company!.logo} alt={company!.name} style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "linear-gradient(135deg, #7042f8, #00d1ff)" }}>
                <Building2 size={28} color="#fff" />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>{company!.name}</h1>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 6, background: "var(--accent-purple-bg)", border: "1px solid var(--accent-purple-border)", color: "var(--accent-purple)" }}>{company!.industry}</span>
              </div>
              <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: 600 }}>{company!.bio}</p>
              {company!.website && (
                <a href={company!.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 13, color: "var(--accent-cyan)", textDecoration: "none" }}>
                  <Globe size={14} /> {company!.website}
                </a>
              )}
            </div>
          </div>

          <div style={divider}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>Tech Stack</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {company!.techStack.map((tech) => (
                <span key={tech} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, background: "rgba(0,209,255,0.07)", border: "1px solid rgba(0,209,255,0.15)", color: "var(--accent-cyan)" }}>{tech}</span>
              ))}
            </div>
          </div>

          <div style={{ ...divider, display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[{ v: company!.teamMembers.length, l: "Team Members" }, { v: company!.projects.length, l: "Projects" }, { v: company!.techStack.length, l: "Technologies" }].map(({ v, l }) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{v}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>Team</h2>
          {company!.teamMembers.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No team members listed.</p>
          ) : (
            <div className="team-grid">
              {company!.teamMembers.map((member) => {
                const [c1, c2] = avatarColor(member.name);
                return (
                  <div key={member.id} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
                    {member.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.avatar} alt={member.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `linear-gradient(135deg, ${c1}, ${c2})`, fontSize: 14, fontWeight: 700, color: "#fff" }}>
                        {getInitials(member.name)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{member.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{member.role}</div>
                    </div>
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "var(--accent-purple-bg)", border: "1px solid var(--accent-purple-border)", color: "var(--accent-purple)", flexShrink: 0, textDecoration: "none" }}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>Projects</h2>
          {company!.projects.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No projects listed.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {company!.projects.map((project) => (
                <div key={project.id} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,209,255,0.08)", border: "1px solid rgba(0,209,255,0.15)", flexShrink: 0 }}>
                        <FolderGit2 size={16} style={{ color: "var(--accent-cyan)" }} />
                      </div>
                      <h4 style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 15, margin: 0 }}>{project.title}</h4>
                    </div>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--accent-cyan)", textDecoration: "none", flexShrink: 0, padding: "4px 10px", borderRadius: 6, background: "rgba(0,209,255,0.06)", border: "1px solid rgba(0,209,255,0.15)" }}>
                        <ExternalLink size={12} /> View
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)", margin: 0 }}>{project.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {project.techStack.map((tech) => (
                      <span key={tech} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, background: "rgba(0,209,255,0.06)", border: "1px solid rgba(0,209,255,0.12)", color: "var(--accent-cyan)" }}>{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
