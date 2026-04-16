"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", minHeight: "85vh" }}>
      <div style={{ position: "relative", maxWidth: 700, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>

        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, padding: "7px 16px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 28, background: "var(--accent-purple-bg)", border: "1px solid var(--accent-purple-border)", color: "var(--accent-purple)" }}>
          <Sparkles size={12} />
          Ministry Tech Incubator
        </motion.span>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 0.95, margin: 0 }}>
          <span style={{ color: "var(--text-primary)" }}>Tech</span>
          <span className="hero-title-folio">Folio</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginTop: 20, fontSize: 16, maxWidth: 480, lineHeight: 1.7, color: "var(--text-secondary)" }}>
          A curated directory of tech startups in our incubator. Discover teams, explore projects, and connect.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="#directory"
            className="btn-press"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
              const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
              e.currentTarget.style.transform = `perspective(400px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.02)`;
            }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: "linear-gradient(135deg, #7042f8, #00d1ff)", transition: "box-shadow 0.2s, transform 0.15s ease" }}
          >
            Explore Companies <ArrowRight size={15} />
          </Link>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--bg-card-border)", color: "var(--text-secondary)" }}>
            List Your Company
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, marginTop: 56, paddingTop: 28, borderTop: "1px solid var(--bg-card-border)" }}>
          {[{ value: "20+", label: "Companies" }, { value: "150+", label: "Experts" }, { value: "50+", label: "Projects" }].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div className="stat-value">{value}</div>
              <div style={{ fontSize: 12, marginTop: 4, color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
