"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme-context";

export default function StarsBackground() {
  const glowRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      const color = isDark ? "rgba(112,66,248,0.07)" : "rgba(112,66,248,0.04)";
      glowRef.current.style.background = `radial-gradient(600px circle at ${x}% ${y}%, ${color}, transparent 60%)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isDark]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: "var(--bg)", transition: "background 0.3s ease" }}>
      {/* Grid */}
      <div className="absolute inset-0" style={{
        opacity: isDark ? 0.03 : 0.04,
        backgroundImage: isDark
          ? "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
          : "linear-gradient(rgba(112,66,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(112,66,248,0.08) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      {/* Top glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none" style={{
        background: isDark
          ? "radial-gradient(ellipse, rgba(112,66,248,0.08) 0%, transparent 70%)"
          : "radial-gradient(ellipse, rgba(112,66,248,0.06) 0%, transparent 70%)",
      }} />

      {/* Bottom right glow */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] pointer-events-none" style={{
        background: isDark
          ? "radial-gradient(ellipse, rgba(0,209,255,0.05) 0%, transparent 70%)"
          : "radial-gradient(ellipse, rgba(0,153,204,0.04) 0%, transparent 70%)",
      }} />

      {/* Mouse-follow glow */}
      <div ref={glowRef} className="absolute inset-0 pointer-events-none transition-[background] duration-300 ease-out" />
    </div>
  );
}
