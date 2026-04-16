"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getMyCompany, updateMyCompany,
  addTeamMember, removeTeamMember,
  addProject, removeProject,
} from "@/services/dashboard";
import { getMyPositions, createPosition, deletePosition } from "@/services/positions";
import {
  getApplicationsForPosition,
  getMyApplications,
  updateApplicationStatus,
} from "@/services/applications";
import type { Company } from "@/types";
import type { Position } from "@/services/positions";
import type { Application } from "@/services/applications";
import { SkeletonCard, SkeletonList, Skeleton, SkeletonDashboardRow } from "@/components/ui/Skeleton";
import {
  Building2, Users, FolderKanban, Briefcase, Inbox,
  Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronUp, Handshake,
} from "lucide-react";

const TECH_OPTIONS = [
  "React","Next.js","Vue","Angular","Node.js","Python","Django","Laravel","PHP",
  "Java","Spring","Go","Rust","TypeScript","PostgreSQL","MySQL","MongoDB","Redis",
  "Docker","Kubernetes","AWS","Azure","GCP","GraphQL","REST","Flutter","React Native",
];
const INDUSTRIES = [
  "FinTech","HealthTech","EdTech","E-Commerce","AI / ML","Cybersecurity",
  "Cloud & DevOps","SaaS","IoT","GovTech","Other",
];

const card = { borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" };
const inp = { background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-primary)", borderRadius: 10, padding: "9px 13px", width: "100%", outline: "none", fontSize: 14 };
const lbl = { color: "var(--text-secondary)", fontSize: 12, fontWeight: 500 as const, display: "block" as const, marginBottom: 5 };

const appStatusColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  PENDING:  { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24", label: "Pending" },
  ACCEPTED: { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   text: "#4ade80", label: "Accepted" },
  REJECTED: { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   text: "#f87171", label: "Rejected" },
};

const companyStatusColors: Record<string, { bg: string; border: string; text: string }> = {
  PENDING:  { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24" },
  APPROVED: { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   text: "#4ade80" },
  REJECTED: { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   text: "#f87171" },
};

type Tab = "info" | "team" | "projects" | "positions" | "applications";

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tab, setTab] = useState<Tab>("info");
  const [pageLoading, setPageLoading] = useState(true);

  // Info edit
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "", industry: "", techStack: [] as string[], website: "" });
  const [saving, setSaving] = useState(false);

  // Team
  const [addingMember, setAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", linkedin: "" });

  // Projects
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", techStack: [] as string[], url: "" });

  // Positions
  const [addingPosition, setAddingPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({ title: "", description: "", type: "HIRING", techStack: [] as string[] });

  // Applications — received (on my positions) grouped by position
  const [receivedApps, setReceivedApps] = useState<Record<string, Application[]>>({});
  const [expandedPos, setExpandedPos] = useState<string | null>(null);
  // Applications — sent by my company
  const [sentApps, setSentApps] = useState<Application[]>([]);
  const [appsSubTab, setAppsSubTab] = useState<"received" | "sent">("received");

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [c, p, sent] = await Promise.all([
        getMyCompany(token),
        getMyPositions(token),
        getMyApplications(token),
      ]);
      setCompany(c);
      setPositions(p);
      setSentApps(sent);
    } catch {}
    setPageLoading(false);
  }, [token]);

  const loadReceivedForPosition = useCallback(async (positionId: string) => {
    if (!token) return;
    try {
      const apps = await getApplicationsForPosition(token, positionId);
      setReceivedApps(prev => ({ ...prev, [positionId]: apps }));
    } catch {}
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!authLoading && user?.role !== "COMPANY") { router.push("/"); return; }
    if (!authLoading && token) load();
  }, [authLoading, user, token, router, load]);

  const togglePositionApps = (posId: string) => {
    if (expandedPos === posId) { setExpandedPos(null); return; }
    setExpandedPos(posId);
    if (!receivedApps[posId]) loadReceivedForPosition(posId);
  };

  const handleStatusUpdate = async (appId: string, status: "ACCEPTED" | "REJECTED", positionId: string) => {
    if (!token) return;
    setActionLoading(appId);
    await updateApplicationStatus(token, appId, status);
    await loadReceivedForPosition(positionId);
    setActionLoading(null);
  };

  const startEdit = () => {
    if (!company) return;
    setEditForm({ name: company.name, bio: company.bio, industry: company.industry, techStack: company.techStack, website: company.website || "" });
    setEditing(true);
  };
  const saveEdit = async () => {
    if (!token) return;
    setSaving(true);
    await updateMyCompany(token, editForm);
    await load();
    setEditing(false);
    setSaving(false);
  };
  const handleAddMember = async () => {
    if (!token || !newMember.name || !newMember.role) return;
    setActionLoading("add-member");
    await addTeamMember(token, newMember);
    await load();
    setNewMember({ name: "", role: "", linkedin: "" });
    setAddingMember(false);
    setActionLoading(null);
  };
  const handleRemoveMember = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    await removeTeamMember(token, id);
    await load();
    setActionLoading(null);
  };
  const handleAddProject = async () => {
    if (!token || !newProject.title || !newProject.description) return;
    setActionLoading("add-project");
    await addProject(token, newProject);
    await load();
    setNewProject({ title: "", description: "", techStack: [], url: "" });
    setAddingProject(false);
    setActionLoading(null);
  };
  const handleRemoveProject = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    await removeProject(token, id);
    await load();
    setActionLoading(null);
  };
  const handleAddPosition = async () => {
    if (!token || !newPosition.title || !newPosition.description) return;
    setActionLoading("add-position");
    await createPosition(token, newPosition);
    await load();
    setNewPosition({ title: "", description: "", type: "HIRING", techStack: [] });
    setAddingPosition(false);
    setActionLoading(null);
  };
  const handleDeletePosition = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    await deletePosition(token, id);
    await load();
    setActionLoading(null);
  };
  const toggleTech = (tech: string, arr: string[], setArr: (v: string[]) => void) => {
    setArr(arr.includes(tech) ? arr.filter((t) => t !== tech) : [...arr, tech]);
  };

  if (authLoading || pageLoading) {
    return (
      <div style={{ minHeight: "100vh", padding: "100px 24px 60px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <Skeleton width="40%" height={32} borderRadius={10} />
            <div style={{ marginTop: 10 }}><Skeleton width="20%" height={16} borderRadius={6} /></div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {[1,2,3,4,5].map(i => <Skeleton key={i} width={100} height={34} borderRadius={8} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3,4].map(i => <SkeletonDashboardRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }  if (!company) return null;

  const sc = companyStatusColors[company.status];
  const tabs: { key: Tab; label: string; Icon: typeof Building2 }[] = [
    { key: "info",         label: "Company Info", Icon: Building2 },
    { key: "team",         label: "Team",         Icon: Users },
    { key: "projects",     label: "Projects",     Icon: FolderKanban },
    { key: "positions",    label: "Positions",    Icon: Briefcase },
    { key: "applications", label: "Applications", Icon: Inbox },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{company.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>{company.status}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{company.industry}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              background: tab === key ? "var(--accent-purple-bg)" : "var(--bg-card)",
              border: tab === key ? "1px solid rgba(112,66,248,0.35)" : "1px solid var(--bg-card-border)",
              color: tab === key ? "var(--accent-purple)" : "var(--text-secondary)",
            }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* INFO TAB */}
        {tab === "info" && (
          <div style={{ ...card, padding: 24 }}>
            {!editing ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Company Details</h2>
                  <button onClick={startEdit} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", background: "rgba(112,66,248,0.1)", border: "1px solid rgba(112,66,248,0.25)", color: "var(--accent-purple)" }}>
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><span style={lbl}>Bio</span><p style={{ color: "var(--text-primary)", fontSize: 14, margin: 0 }}>{company.bio}</p></div>
                  {company.website && <div><span style={lbl}>Website</span><a href={company.website} target="_blank" rel="noreferrer" style={{ color: "var(--accent-cyan)", fontSize: 14 }}>{company.website}</a></div>}
                  <div>
                    <span style={lbl}>Tech Stack</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {company.techStack.map((t) => <span key={t} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: "rgba(0,209,255,0.08)", border: "1px solid rgba(0,209,255,0.2)", color: "var(--accent-cyan)" }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><label style={lbl}>Company Name</label><input style={inp} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                  <div><label style={lbl}>Bio</label><textarea rows={3} style={{ ...inp, resize: "vertical" }} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} /></div>
                  <div>
                    <label style={lbl}>Industry</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {INDUSTRIES.map((ind) => (
                        <button key={ind} type="button" onClick={() => setEditForm({ ...editForm, industry: ind })} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: editForm.industry === ind ? "linear-gradient(135deg,#7042f8,#00d1ff)" : "var(--bg-input)", border: editForm.industry === ind ? "1px solid transparent" : "1px solid var(--bg-input-border)", color: editForm.industry === ind ? "var(--text-primary)" : "var(--text-secondary)" }}>{ind}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Tech Stack</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {TECH_OPTIONS.map((tech) => (
                        <button key={tech} type="button" onClick={() => toggleTech(tech, editForm.techStack, (v) => setEditForm({ ...editForm, techStack: v }))} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", background: editForm.techStack.includes(tech) ? "rgba(0,209,255,0.15)" : "var(--bg-input)", border: editForm.techStack.includes(tech) ? "1px solid rgba(0,209,255,0.4)" : "1px solid var(--bg-card-border)", color: editForm.techStack.includes(tech) ? "var(--accent-cyan)" : "var(--text-secondary)" }}>{tech}</button>
                      ))}
                    </div>
                  </div>
                  <div><label style={lbl}>Website</label><input style={inp} placeholder="https://" value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} /></div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button onClick={saveEdit} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "linear-gradient(135deg,#7042f8,#00d1ff)", color: "#fff", opacity: saving ? 0.6 : 1 }}>
                    <Check size={13} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditing(false)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-secondary)" }}>
                    <X size={13} /> Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TEAM TAB */}
        {tab === "team" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {company.teamMembers.map((m) => (
              <div key={m.id} style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{m.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>{m.role}</p>
                </div>
                <button onClick={() => handleRemoveMember(m.id)} disabled={actionLoading === m.id} style={{ padding: "6px 10px", borderRadius: 7, cursor: "pointer", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", opacity: actionLoading === m.id ? 0.5 : 1 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {addingMember ? (
              <div style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <input style={inp} placeholder="Full Name *" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                <input style={inp} placeholder="Role / Title *" value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} />
                <input style={inp} placeholder="LinkedIn URL (optional)" value={newMember.linkedin} onChange={(e) => setNewMember({ ...newMember, linkedin: e.target.value })} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleAddMember} disabled={actionLoading === "add-member"} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "linear-gradient(135deg,#7042f8,#00d1ff)", color: "#fff" }}><Check size={13} /> Add</button>
                  <button onClick={() => setAddingMember(false)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-secondary)" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingMember(true)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, padding: "10px 18px", borderRadius: 10, cursor: "pointer", background: "rgba(112,66,248,0.08)", border: "1px dashed rgba(112,66,248,0.35)", color: "var(--accent-purple)" }}>
                <Plus size={14} /> Add Member
              </button>
            )}
          </div>
        )}

        {/* PROJECTS TAB */}
        {tab === "projects" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {company.projects.map((p) => (
              <div key={p.id} style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{p.title}</p>
                  <p style={{ margin: "4px 0 8px", fontSize: 12, color: "var(--text-secondary)" }}>{p.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {p.techStack.map((t) => <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(0,209,255,0.07)", color: "var(--accent-cyan)" }}>{t}</span>)}
                  </div>
                </div>
                <button onClick={() => handleRemoveProject(p.id)} disabled={actionLoading === p.id} style={{ padding: "6px 10px", borderRadius: 7, cursor: "pointer", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", opacity: actionLoading === p.id ? 0.5 : 1, flexShrink: 0 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {addingProject ? (
              <div style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <input style={inp} placeholder="Project Title *" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                <textarea rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Description *" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                <div>
                  <label style={lbl}>Tech Stack</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {TECH_OPTIONS.slice(0, 16).map((tech) => (
                      <button key={tech} type="button" onClick={() => toggleTech(tech, newProject.techStack, (v) => setNewProject({ ...newProject, techStack: v }))} style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: newProject.techStack.includes(tech) ? "rgba(0,209,255,0.15)" : "var(--bg-input)", border: newProject.techStack.includes(tech) ? "1px solid rgba(0,209,255,0.35)" : "1px solid var(--bg-card-border)", color: newProject.techStack.includes(tech) ? "var(--accent-cyan)" : "var(--text-secondary)" }}>{tech}</button>
                    ))}
                  </div>
                </div>
                <input style={inp} placeholder="Project URL (optional)" value={newProject.url} onChange={(e) => setNewProject({ ...newProject, url: e.target.value })} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleAddProject} disabled={actionLoading === "add-project"} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "linear-gradient(135deg,#7042f8,#00d1ff)", color: "#fff" }}><Check size={13} /> Add</button>
                  <button onClick={() => setAddingProject(false)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-secondary)" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingProject(true)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, padding: "10px 18px", borderRadius: 10, cursor: "pointer", background: "rgba(112,66,248,0.08)", border: "1px dashed rgba(112,66,248,0.35)", color: "var(--accent-purple)" }}>
                <Plus size={14} /> Add Project
              </button>
            )}
          </div>
        )}

        {/* POSITIONS TAB */}
        {tab === "positions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {positions.map((pos) => (
              <div key={pos.id} style={{ ...card, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{pos.title}</p>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: pos.type === "HIRING" ? "rgba(34,197,94,0.1)" : "rgba(112,66,248,0.1)", border: pos.type === "HIRING" ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(112,66,248,0.25)", color: pos.type === "HIRING" ? "#4ade80" : "var(--accent-purple)" }}>{pos.type}</span>
                    </div>
                    <p style={{ margin: "4px 0 8px", fontSize: 12, color: "var(--text-secondary)" }}>{pos.description}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {pos.techStack.map((t) => <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(0,209,255,0.07)", color: "var(--accent-cyan)" }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => togglePositionApps(pos.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, cursor: "pointer", background: "rgba(112,66,248,0.08)", border: "1px solid rgba(112,66,248,0.2)", color: "var(--accent-purple)", fontSize: 12 }}>
                      <Inbox size={12} /> {expandedPos === pos.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    <button onClick={() => handleDeletePosition(pos.id)} disabled={actionLoading === pos.id} style={{ padding: "6px 10px", borderRadius: 7, cursor: "pointer", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", opacity: actionLoading === pos.id ? 0.5 : 1 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Inline applications for this position */}
                {expandedPos === pos.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--bg-card-border)" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {pos.type === "COLLABORATION" ? "Collaboration Requests" : "Applications"}
                    </p>
                    {!receivedApps[pos.id] ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2].map(i => <SkeletonDashboardRow key={i} />)}</div>
                    ) : receivedApps[pos.id].length === 0 ? (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>No {pos.type === "COLLABORATION" ? "requests" : "applications"} yet</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {receivedApps[pos.id].map((app) => {
                          const sc = appStatusColors[app.status];
                          return (
                            <div key={app.id} style={{ borderRadius: 10, padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" }}>
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                    <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{app.applicantName}</p>
                                    {app.applicantCompany && (
                                      <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 4, background: "rgba(112,66,248,0.1)", color: "var(--accent-purple)" }}>{app.applicantCompany.name}</span>
                                    )}
                                    <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 4, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>{sc.label}</span>
                                  </div>
                                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{app.applicantEmail}</p>
                                  {app.message && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{app.message}</p>}
                                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{new Date(app.createdAt).toLocaleDateString()}</p>
                                </div>
                                {app.status === "PENDING" && (
                                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                    <button onClick={() => handleStatusUpdate(app.id, "ACCEPTED", pos.id)} disabled={actionLoading === app.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.1)", color: "#4ade80", opacity: actionLoading === app.id ? 0.5 : 1 }}>
                                      <Check size={12} /> {pos.type === "COLLABORATION" ? "Accept" : "Accept"}
                                    </button>
                                    <button onClick={() => handleStatusUpdate(app.id, "REJECTED", pos.id)} disabled={actionLoading === app.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", opacity: actionLoading === app.id ? 0.5 : 1 }}>
                                      <X size={12} /> Decline
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {addingPosition ? (
              <div style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <input style={inp} placeholder="Position Title *" value={newPosition.title} onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })} />
                <textarea rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Description *" value={newPosition.description} onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })} />
                <div style={{ display: "flex", gap: 8 }}>
                  {["HIRING", "COLLABORATION"].map((t) => (
                    <button key={t} type="button" onClick={() => setNewPosition({ ...newPosition, type: t })} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: newPosition.type === t ? "linear-gradient(135deg,#7042f8,#00d1ff)" : "var(--bg-input)", border: newPosition.type === t ? "1px solid transparent" : "1px solid var(--bg-input-border)", color: newPosition.type === t ? "var(--text-primary)" : "var(--text-secondary)" }}>{t}</button>
                  ))}
                </div>
                <div>
                  <label style={lbl}>Tech Stack</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {TECH_OPTIONS.slice(0, 16).map((tech) => (
                      <button key={tech} type="button" onClick={() => toggleTech(tech, newPosition.techStack, (v) => setNewPosition({ ...newPosition, techStack: v }))} style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, cursor: "pointer", background: newPosition.techStack.includes(tech) ? "rgba(0,209,255,0.15)" : "var(--bg-input)", border: newPosition.techStack.includes(tech) ? "1px solid rgba(0,209,255,0.35)" : "1px solid var(--bg-card-border)", color: newPosition.techStack.includes(tech) ? "var(--accent-cyan)" : "var(--text-secondary)" }}>{tech}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleAddPosition} disabled={actionLoading === "add-position"} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "linear-gradient(135deg,#7042f8,#00d1ff)", color: "#fff" }}><Check size={13} /> Post</button>
                  <button onClick={() => setAddingPosition(false)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-secondary)" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingPosition(true)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, padding: "10px 18px", borderRadius: 10, cursor: "pointer", background: "rgba(112,66,248,0.08)", border: "1px dashed rgba(112,66,248,0.35)", color: "var(--accent-purple)" }}>
                <Plus size={14} /> Post Position
              </button>
            )}
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {tab === "applications" && (
          <div>
            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {(["received", "sent"] as const).map((st) => (
                <button key={st} onClick={() => setAppsSubTab(st)} style={{
                  padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  background: appsSubTab === st ? "var(--accent-purple-bg)" : "var(--bg-card)",
                  border: appsSubTab === st ? "1px solid rgba(112,66,248,0.35)" : "1px solid var(--bg-card-border)",
                  color: appsSubTab === st ? "var(--accent-purple)" : "var(--text-secondary)",
                }}>
                  {st === "received" ? "Received" : "Sent"}
                </button>
              ))}
            </div>

            {/* RECEIVED — grouped by position */}
            {appsSubTab === "received" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {positions.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No positions posted yet.</p>}
                {positions.map((pos) => (
                  <div key={pos.id} style={{ ...card, padding: "16px 20px" }}>
                    <button onClick={() => togglePositionApps(pos.id)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {pos.type === "COLLABORATION" ? <Handshake size={14} color="var(--accent-purple)" /> : <Briefcase size={14} color="#4ade80" />}
                        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{pos.title}</span>
                        <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 4, background: pos.type === "HIRING" ? "rgba(34,197,94,0.1)" : "rgba(112,66,248,0.1)", color: pos.type === "HIRING" ? "#4ade80" : "var(--accent-purple)" }}>{pos.type}</span>
                      </div>
                      {expandedPos === pos.id ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                    </button>

                    {expandedPos === pos.id && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--bg-card-border)" }}>
                        {!receivedApps[pos.id] ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2].map(i => <SkeletonDashboardRow key={i} />)}</div>
                        ) : receivedApps[pos.id].length === 0 ? (
                          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>No {pos.type === "COLLABORATION" ? "requests" : "applications"} yet</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {receivedApps[pos.id].map((app) => {
                              const sc = appStatusColors[app.status];
                              return (
                                <div key={app.id} style={{ borderRadius: 10, padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" }}>
                                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{app.applicantName}</p>
                                        {app.applicantCompany && (
                                          <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 4, background: "rgba(112,66,248,0.1)", color: "var(--accent-purple)" }}>{app.applicantCompany.name}</span>
                                        )}
                                        <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 4, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>{sc.label}</span>
                                      </div>
                                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{app.applicantEmail}</p>
                                      {app.message && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{app.message}</p>}
                                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{new Date(app.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    {app.status === "PENDING" && (
                                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                        <button onClick={() => handleStatusUpdate(app.id, "ACCEPTED", pos.id)} disabled={actionLoading === app.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.1)", color: "#4ade80", opacity: actionLoading === app.id ? 0.5 : 1 }}>
                                          <Check size={12} /> Accept
                                        </button>
                                        <button onClick={() => handleStatusUpdate(app.id, "REJECTED", pos.id)} disabled={actionLoading === app.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", opacity: actionLoading === app.id ? 0.5 : 1 }}>
                                          <X size={12} /> Decline
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SENT */}
            {appsSubTab === "sent" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sentApps.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No applications or collaboration requests sent yet.</p>}
                {sentApps.map((app) => {
                  const sc = appStatusColors[app.status];
                  const isCollab = app.position?.type === "COLLABORATION";
                  return (
                    <div key={app.id} style={{ ...card, padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            {isCollab ? <Handshake size={13} color="var(--accent-purple)" /> : <Briefcase size={13} color="#4ade80" />}
                            <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{app.position?.title || "Position"}</p>
                            <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 4, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>{sc.label}</span>
                          </div>
                          {app.position?.company && (
                            <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-secondary)" }}>at {app.position.company.name}</p>
                          )}
                          {app.message && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{app.message}</p>}
                          <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
