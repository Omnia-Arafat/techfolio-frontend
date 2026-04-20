"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerCompany } from "@/services/company";
import {
  Building2,
  Users,
  FolderKanban,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const INDUSTRIES = [
  "FinTech", "HealthTech", "EdTech", "E-Commerce", "AI / ML",
  "Cybersecurity", "Cloud & DevOps", "SaaS", "IoT", "GovTech", "Other",
];

const TECH_OPTIONS = [
  "React", "Next.js", "Vue", "Angular", "Node.js", "Python", "Django",
  "Laravel", "PHP", "Java", "Spring", "Go", "Rust", "TypeScript",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes",
  "AWS", "Azure", "GCP", "GraphQL", "REST", "Flutter", "React Native",
];

type TeamMember = { name: string; role: string; linkedin: string };
type Project = { title: string; description: string; techStack: string[]; url: string };

interface FormData {
  email: string;
  name: string;
  bio: string;
  industry: string;
  techStack: string[];
  website: string;
  teamMembers: TeamMember[];
  projects: Project[];
}

interface RegistrationResult {
  email: string;
  generatedPassword: string;
}

const STEPS = [
  { label: "Company Info", icon: Building2 },
  { label: "Team", icon: Users },
  { label: "Projects", icon: FolderKanban },
];

const inputStyle = {
  background: "var(--bg-input)",
  border: "1px solid var(--bg-input-border)",
  color: "var(--text-primary)",
  borderRadius: "10px",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  fontSize: "14px",
};

const labelStyle = { color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, marginBottom: "6px", display: "block" as const };

const errorBorder = "1px solid rgba(239,68,68,0.5)";
const normalBorder = "1px solid var(--bg-input-border)";

export default function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<RegistrationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<FormData>({
    email: "",
    name: "",
    bio: "",
    industry: "",
    techStack: [],
    website: "",
    teamMembers: [{ name: "", role: "", linkedin: "" }],
    projects: [{ title: "", description: "", techStack: [], url: "" }],
  });

  // Validation per step
  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (!form.email.trim()) return "email";
      if (!form.name.trim()) return "name";
      if (!form.bio.trim()) return "bio";
      if (!form.industry) return "industry";
      if (form.techStack.length === 0) return "techStack";
    }
    if (s === 1) {
      const m = form.teamMembers[0];
      if (!m?.name.trim()) return "member-0-name";
      if (!m?.role.trim()) return "member-0-role";
    }
    if (s === 2) {
      const p = form.projects[0];
      if (!p?.title.trim()) return "project-0-title";
      if (!p?.description.trim()) return "project-0-description";
    }
    return null;
  };

  const goNext = () => {
    const failField = validateStep(step);
    if (failField) {
      setTouched((t) => ({ ...t, [failField]: true }));
      // Focus the element
      const el = document.getElementById(`field-${failField}`);
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStep((s) => s + 1);
  };

  const isFieldError = (field: string, value: string | string[]) => {
    if (!touched[field]) return false;
    if (Array.isArray(value)) return value.length === 0;
    return !value.trim();
  };

  const fieldBorder = (field: string, value: string | string[]) =>
    isFieldError(field, value) ? errorBorder : normalBorder;

  const toggleTech = (tech: string, arr: string[], setArr: (v: string[]) => void) => {
    setArr(arr.includes(tech) ? arr.filter((t) => t !== tech) : [...arr, tech]);
  };

  const updateTeamMember = (i: number, field: keyof TeamMember, value: string) => {
    const updated = [...form.teamMembers];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, teamMembers: updated });
  };

  const updateProject = (i: number, field: keyof Project, value: string | string[]) => {
    const updated = [...form.projects];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, projects: updated });
  };

  const handleSubmit = async () => {
    const failField = validateStep(2);
    if (failField) {
      setTouched((t) => ({ ...t, [failField]: true }));
      document.getElementById(`field-${failField}`)?.focus();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await registerCompany({
        email: form.email,
        name: form.name,
        bio: form.bio,
        industry: form.industry,
        techStack: form.techStack,
        website: form.website || undefined,
        teamMembers: form.teamMembers.filter((m) => m.name && m.role),
        projects: form.projects.filter((p) => p.title && p.description),
      });
      setLoading(false);
      if (result.success) {
        setCredentials({ email: result.email!, generatedPassword: result.generatedPassword! });
        setSuccess(true);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    } catch {
      setLoading(false);
      setError("Connection error. Is the backend running?");
    }
  };

  if (success && credentials) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "60px 0", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #7042f8, #00d1ff)" }}>
          <CheckCircle2 size={32} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Registration Submitted!</h3>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-secondary)" }}>
            Your company profile is pending admin approval.
          </p>
        </div>

        {/* Credentials box */}
        <div style={{ width: "100%", maxWidth: 400, borderRadius: 14, padding: "20px 24px", background: "rgba(112,66,248,0.08)", border: "1px solid rgba(112,66,248,0.25)", textAlign: "left" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-purple)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Login Credentials</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Email</span>
              <p style={{ margin: "2px 0 0", fontSize: 14, color: "var(--text-primary)", fontFamily: "monospace" }}>{credentials.email}</p>
            </div>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Password (shown once)</span>
              <p style={{ margin: "2px 0 0", fontSize: 14, color: "var(--accent-cyan)", fontFamily: "monospace", letterSpacing: "0.05em" }}>{credentials.generatedPassword}</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12, marginBottom: 0 }}>Save these credentials - the password won&apos;t be shown again.</p>
        </div>

        <a href="/reset-password" style={{ fontSize: 13, color: "var(--accent-purple)", textDecoration: "none" }}>Change your password</a>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Step indicators */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isDone = i < step;
          const isCurrent = i === step;
          return (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20,
                  fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
                  background: isCurrent ? "linear-gradient(135deg, #7042f8, #00d1ff)" : isDone ? "var(--accent-purple-bg)" : "var(--bg-input)",
                  border: isDone || isCurrent ? "1px solid var(--accent-purple-border)" : "1px solid var(--bg-input-border)",
                  color: isCurrent ? "#fff" : isDone ? "var(--accent-purple)" : "var(--text-muted)",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={13} />
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 24, height: 1, background: i < step ? "linear-gradient(90deg, #7042f8, #00d1ff)" : "var(--bg-input-border)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form panel */}
      <div
        style={{
          borderRadius: 14,
          padding: "28px",
          background: "var(--bg-card)",
          border: "1px solid var(--bg-card-border)",
        }}
      >
        <AnimatePresence mode="wait">
          {/* Step 0: Company Info */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <h3 className="text-xl font-bold text-white">Company Information</h3>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  id="field-email"
                  type="email"
                  style={{ ...inputStyle, border: fieldBorder("email", form.email) }}
                  placeholder="contact@yourcompany.com"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setTouched((t) => ({ ...t, email: false })); }}
                />
                {isFieldError("email", form.email) && <span style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "block" }}>Email is required</span>}
              </div>

              <div>
                <label style={labelStyle}>Company Name *</label>
                <input
                  id="field-name"
                  style={{ ...inputStyle, border: fieldBorder("name", form.name) }}
                  placeholder="e.g. Nova Systems"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setTouched((t) => ({ ...t, name: false })); }}
                />
                {isFieldError("name", form.name) && <span style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "block" }}>Company name is required</span>}
              </div>
              <div>
                <label style={labelStyle}>Short Bio *</label>
                <textarea
                  id="field-bio"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", border: fieldBorder("bio", form.bio) }}
                  placeholder="What does your company do?"
                  value={form.bio}
                  onChange={(e) => { setForm({ ...form, bio: e.target.value }); setTouched((t) => ({ ...t, bio: false })); }}
                />
                {isFieldError("bio", form.bio) && <span style={{ fontSize: 11, color: "#f87171", marginTop: 4, display: "block" }}>Bio is required</span>}
              </div>
              <div>
                <label style={{ ...labelStyle, color: isFieldError("industry", form.industry) ? "#f87171" : labelStyle.color }}>Industry * {isFieldError("industry", form.industry) && "- select one"}</label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setForm({ ...form, industry: ind })}
                      className="px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                      style={{
                        background:
                          form.industry === ind
                            ? "linear-gradient(135deg, #7042f8, #00d1ff)"
                            : "var(--bg-input)",
                        border:
                          form.industry === ind
                            ? "1px solid transparent"
                            : "1px solid var(--bg-input-border)",
                        color: form.industry === ind ? "#fff" : "var(--text-secondary)",
                      }}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label id="field-techStack" style={{ ...labelStyle, color: isFieldError("techStack", form.techStack) ? "#f87171" : labelStyle.color }}>Tech Stack * {isFieldError("techStack", form.techStack) && "- select at least one"}</label>
                <div className="flex flex-wrap gap-2">
                  {TECH_OPTIONS.map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() =>
                        toggleTech(tech, form.techStack, (v) =>
                          setForm({ ...form, techStack: v })
                        )
                      }
                      className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
                      style={{
                        background: form.techStack.includes(tech)
                          ? "rgba(0,209,255,0.15)"
                          : "var(--bg-input)",
                        border: form.techStack.includes(tech)
                          ? "1px solid rgba(0,209,255,0.4)"
                          : "1px solid var(--bg-input-border)",
                        color: form.techStack.includes(tech)
                          ? "var(--accent-cyan)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Website (optional)</label>
                <input
                  style={inputStyle}
                  placeholder="https://yourcompany.com"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
            </motion.div>
          )}

          {/* Step 1: Team */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <h3 className="text-xl font-bold text-white">Team Members</h3>
              {form.teamMembers.map((member, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl flex flex-col gap-3"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                      Member #{i + 1}
                    </span>
                    {form.teamMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            teamMembers: form.teamMembers.filter((_, idx) => idx !== i),
                          })
                        }
                        style={{ color: "#f87171" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    id={`field-member-${i}-name`}
                    style={{ ...inputStyle, border: fieldBorder(`member-${i}-name`, member.name) }}
                    placeholder="Full Name *"
                    value={member.name}
                    onChange={(e) => { updateTeamMember(i, "name", e.target.value); setTouched((t) => ({ ...t, [`member-${i}-name`]: false })); }}
                  />
                  <input
                    id={`field-member-${i}-role`}
                    style={{ ...inputStyle, border: fieldBorder(`member-${i}-role`, member.role) }}
                    placeholder="Role / Title *"
                    value={member.role}
                    onChange={(e) => { updateTeamMember(i, "role", e.target.value); setTouched((t) => ({ ...t, [`member-${i}-role`]: false })); }}
                  />
                  <input
                    style={inputStyle}
                    placeholder="LinkedIn URL (optional)"
                    value={member.linkedin}
                    onChange={(e) => updateTeamMember(i, "linkedin", e.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    teamMembers: [...form.teamMembers, { name: "", role: "", linkedin: "" }],
                  })
                }
                style={{
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500,
                  padding: "10px 18px", borderRadius: 10, cursor: "pointer",
                  background: "rgba(112,66,248,0.08)",
                  border: "1px dashed rgba(112,66,248,0.35)",
                  color: "var(--accent-purple)", transition: "all 0.15s",
                }}
              >
                <Plus size={14} /> Add Member
              </button>
            </motion.div>
          )}

          {/* Step 2: Projects */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <h3 className="text-xl font-bold text-white">Showcase Projects</h3>
              {form.projects.map((project, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl flex flex-col gap-3"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                      Project #{i + 1}
                    </span>
                    {form.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            projects: form.projects.filter((_, idx) => idx !== i),
                          })
                        }
                        style={{ color: "#f87171" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    id={`field-project-${i}-title`}
                    style={{ ...inputStyle, border: fieldBorder(`project-${i}-title`, project.title) }}
                    placeholder="Project Title *"
                    value={project.title}
                    onChange={(e) => { updateProject(i, "title", e.target.value); setTouched((t) => ({ ...t, [`project-${i}-title`]: false })); }}
                  />
                  <textarea
                    id={`field-project-${i}-description`}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical", border: fieldBorder(`project-${i}-description`, project.description) }}
                    placeholder="Description *"
                    value={project.description}
                    onChange={(e) => { updateProject(i, "description", e.target.value); setTouched((t) => ({ ...t, [`project-${i}-description`]: false })); }}
                  />
                  <div>
                    <p style={{ ...labelStyle }}>Tech Stack</p>
                    <div className="flex flex-wrap gap-1.5">
                      {TECH_OPTIONS.slice(0, 16).map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() =>
                            toggleTech(tech, project.techStack, (v) =>
                              updateProject(i, "techStack", v)
                            )
                          }
                          className="px-2 py-1 rounded-md text-xs transition-all"
                          style={{
                            background: project.techStack.includes(tech)
                              ? "rgba(0,209,255,0.15)"
                              : "var(--bg-input)",
                            border: project.techStack.includes(tech)
                              ? "1px solid rgba(0,209,255,0.35)"
                              : "1px solid var(--bg-card-border)",
                            color: project.techStack.includes(tech)
                              ? "var(--accent-cyan)"
                              : "var(--text-secondary)",
                          }}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    style={inputStyle}
                    placeholder="Project URL (optional)"
                    value={project.url}
                    onChange={(e) => updateProject(i, "url", e.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    projects: [
                      ...form.projects,
                      { title: "", description: "", techStack: [], url: "" },
                    ],
                  })
                }
                style={{
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500,
                  padding: "10px 18px", borderRadius: 10, cursor: "pointer",
                  background: "rgba(112,66,248,0.08)",
                  border: "1px dashed rgba(112,66,248,0.35)",
                  color: "var(--accent-purple)", transition: "all 0.15s",
                }}
              >
                <Plus size={14} /> Add Project
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p style={{ marginTop: 16, fontSize: 13, color: "#f87171", textAlign: "center" }}>{error}</p>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--bg-card-border)" }}>
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              background: "var(--bg-input)", border: "1px solid var(--bg-input-border)",
              color: "var(--text-secondary)", opacity: step === 0 ? 0.3 : 1, transition: "opacity 0.15s",
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                background: "linear-gradient(135deg, #7042f8, #00d1ff)", color: "var(--text-primary)",
              }}
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                background: "linear-gradient(135deg, #7042f8, #00d1ff)", color: "var(--text-primary)",
                opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
              }}
            >
              {loading ? (
                <>Submitting...</>
              ) : (
                <><CheckCircle2 size={14} /> Submit for Approval</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
