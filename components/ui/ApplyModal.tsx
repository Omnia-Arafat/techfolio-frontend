"use client";

import { useState } from "react";
import { Check, FileText, Handshake, Send, X } from "lucide-react";
import type { Position } from "@/services/positions";
import { applyToPosition } from "@/services/applications";

const inp = { background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-primary)", borderRadius: 10, padding: "9px 13px", width: "100%", outline: "none", fontSize: 14 };
const lbl = { color: "var(--text-secondary)", fontSize: 12, fontWeight: 500 as const, display: "block" as const, marginBottom: 5 };

interface ApplyForm {
  applicantName: string;
  applicantEmail: string;
  message: string;
  applicantCompanyId: string;
}

interface ApplyModalProps {
  position: Position;
  onClose: () => void;
  initialForm?: Partial<ApplyForm>;
  isCompanyUser?: boolean;
}

export default function ApplyModal({ position, onClose, initialForm, isCompanyUser }: ApplyModalProps) {
  const isHiring = position.type === "HIRING";
  const [applyForm, setApplyForm] = useState<ApplyForm>({
    applicantName: initialForm?.applicantName || "",
    applicantEmail: initialForm?.applicantEmail || "",
    message: initialForm?.message || "",
    applicantCompanyId: initialForm?.applicantCompanyId || "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCvChange = (file: File | null) => {
    setCvFile(file);
    setCvError(null);
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "doc", "docx"].includes(ext)) {
      setCvError("CV must be a PDF, DOC, or DOCX file");
      setCvFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError("CV must be 5MB or smaller");
      setCvFile(null);
    }
  };

  const canSubmit = applyForm.applicantName && applyForm.applicantEmail && (!isHiring || cvFile) && !cvError;

  const handleApply = async () => {
    if (!canSubmit) return;
    setApplying(true);
    try {
      await applyToPosition({
        positionId: position.id,
        applicantName: applyForm.applicantName,
        applicantEmail: applyForm.applicantEmail,
        message: applyForm.message || undefined,
        applicantCompanyId: applyForm.applicantCompanyId || undefined,
        cv: isHiring ? cvFile || undefined : undefined,
      });
      setApplyResult({
        success: true,
        message: position.type === "COLLABORATION" ? "Collaboration request sent!" : "Application submitted!",
      });
    } catch (e) {
      setApplyResult({ success: false, message: e instanceof Error ? e.message : "Failed to submit" });
    }
    setApplying(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480, borderRadius: 16, padding: "28px", background: "var(--bg-card)", border: "1px solid var(--bg-input-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {position.type === "COLLABORATION" ? "Collaboration Request" : "Job Application"}
            </p>
            <h3 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{position.title}</h3>
            {position.company && <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>{position.company.name}</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
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
            <button onClick={onClose} style={{ marginTop: 20, padding: "8px 24px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "var(--bg-input)", border: "1px solid var(--bg-input-border)", color: "var(--text-secondary)" }}>Close</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isCompanyUser && (
              <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(112,66,248,0.08)", border: "1px solid rgba(112,66,248,0.2)" }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--accent-purple)" }}>
                  {position.type === "COLLABORATION"
                    ? "Sending as your company - the other company will see your profile."
                    : "Applying as your company - your company profile will be shared."}
                </p>
              </div>
            )}
            <div>
              <label style={lbl}>{position.type === "COLLABORATION" ? "Your Company / Name *" : "Your Name *"}</label>
              <input style={inp} placeholder="Name" value={applyForm.applicantName} onChange={(e) => setApplyForm({ ...applyForm, applicantName: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Email *</label>
              <input style={inp} type="email" placeholder="contact@company.com" value={applyForm.applicantEmail} onChange={(e) => setApplyForm({ ...applyForm, applicantEmail: e.target.value })} />
            </div>
            {isHiring && (
              <div>
                <label style={lbl}>CV / Resume *</label>
                <label style={{ ...inp, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", width: "auto" }}>
                  <FileText size={16} style={{ color: "var(--accent-cyan)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: cvFile ? "var(--text-primary)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cvFile ? cvFile.name : "Choose PDF, DOC, or DOCX (max 5MB)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => handleCvChange(e.target.files?.[0] || null)}
                    style={{ display: "none" }}
                  />
                </label>
                {cvError && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#f87171" }}>{cvError}</p>}
              </div>
            )}
            <div>
              <label style={lbl}>{position.type === "COLLABORATION" ? "Why do you want to collaborate? (optional)" : "Cover message (optional)"}</label>
              <textarea rows={3} style={{ ...inp, resize: "vertical" }} placeholder={position.type === "COLLABORATION" ? "Describe the collaboration opportunity..." : "Tell them why you're a great fit..."} value={applyForm.message} onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })} />
            </div>
            <button onClick={handleApply} disabled={applying || !canSubmit} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: "pointer", border: "none", color: "#fff",
              background: position.type === "COLLABORATION" ? "linear-gradient(135deg,#7042f8,#a78bfa)" : "linear-gradient(135deg,#7042f8,#00d1ff)",
              opacity: applying || !canSubmit ? 0.5 : 1,
            }}>
              {applying ? "Sending..." : position.type === "COLLABORATION" ? <><Handshake size={14} /> Send Collaboration Request</> : <><Send size={14} /> Submit Application</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
