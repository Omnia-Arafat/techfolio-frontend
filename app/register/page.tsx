import RegistrationForm from "@/components/forms/RegistrationForm";

export default function RegisterPage() {
  return (
    <div style={{ minHeight: "100vh", width: "100%", padding: "100px 24px 60px" }}>
      <div style={{ maxWidth: 660, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
            List Your{" "}
            <span className="accent-text">Company</span>
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-secondary)" }}>
            Three quick steps. Your profile goes live after admin approval.
          </p>
        </div>

        <RegistrationForm />
      </div>
    </div>
  );
}
