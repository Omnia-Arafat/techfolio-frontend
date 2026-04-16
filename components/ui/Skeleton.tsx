import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, className = "", style }: SkeletonProps) {
  return (
    <div className={`skeleton ${className}`} style={{ width, height, borderRadius, flexShrink: 0, ...style }} />
  );
}

// ── Mirrors CompanyCard exactly ──
export function SkeletonCard() {
  return (
    <div style={{ borderRadius: 14, padding: 22, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)", display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      {/* Header row: logo + name/industry + arrow */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo square */}
          <Skeleton width={42} height={42} borderRadius={10} />
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {/* Company name */}
            <Skeleton width={130} height={15} borderRadius={5} />
            {/* Industry badge */}
            <Skeleton width={72} height={20} borderRadius={4} />
          </div>
        </div>
        {/* Arrow icon placeholder */}
        <Skeleton width={16} height={16} borderRadius={4} style={{ opacity: 0.3 }} />
      </div>

      {/* Bio — 2 lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Skeleton width="100%" height={13} borderRadius={4} />
        <Skeleton width="75%" height={13} borderRadius={4} />
      </div>

      {/* Tech stack tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto", paddingTop: 4 }}>
        <Skeleton width={58} height={22} borderRadius={5} />
        <Skeleton width={48} height={22} borderRadius={5} />
        <Skeleton width={66} height={22} borderRadius={5} />
        <Skeleton width={52} height={22} borderRadius={5} />
      </div>
    </div>
  );
}

// ── Mirrors position/job list row exactly ──
export function SkeletonPositionRow() {
  return (
    <div style={{ borderRadius: 14, padding: "20px 22px", background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        {/* Left: title + badge + desc + tags */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Skeleton width={180} height={15} borderRadius={5} />
            <Skeleton width={60} height={20} borderRadius={5} />
          </div>
          <Skeleton width="90%" height={12} borderRadius={4} />
          <Skeleton width="65%" height={12} borderRadius={4} />
          <div style={{ display: "flex", gap: 5 }}>
            <Skeleton width={55} height={20} borderRadius={5} />
            <Skeleton width={48} height={20} borderRadius={5} />
            <Skeleton width={62} height={20} borderRadius={5} />
          </div>
        </div>
        {/* Right: company card + button */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" }}>
            <Skeleton width={28} height={28} borderRadius={7} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Skeleton width={80} height={12} borderRadius={4} />
              <Skeleton width={55} height={10} borderRadius={4} />
            </div>
          </div>
          <Skeleton width={80} height={34} borderRadius={8} />
        </div>
      </div>
      {/* Date */}
      <Skeleton width={100} height={10} borderRadius={4} style={{ marginTop: 10 }} />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonPositionRow key={i} />)}
    </div>
  );
}

// ── Mirrors admin company row exactly ──
export function SkeletonAdminCard() {
  return (
    <div style={{ borderRadius: 14, padding: 22, background: "var(--bg-card)", border: "1px solid var(--bg-card-border)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
          {/* Logo */}
          <Skeleton width={42} height={42} borderRadius={10} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Name + status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Skeleton width={160} height={16} borderRadius={5} />
              <Skeleton width={62} height={20} borderRadius={5} />
            </div>
            {/* Bio lines */}
            <Skeleton width="95%" height={12} borderRadius={4} />
            <Skeleton width="80%" height={12} borderRadius={4} />
            {/* Tags */}
            <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
              <Skeleton width={68} height={20} borderRadius={4} />
              <Skeleton width={52} height={20} borderRadius={4} />
              <Skeleton width={60} height={20} borderRadius={4} />
            </div>
            {/* Meta */}
            <Skeleton width={180} height={10} borderRadius={4} />
          </div>
        </div>
        {/* Right: action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <Skeleton width={90} height={32} borderRadius={8} />
          <Skeleton width={90} height={32} borderRadius={8} />
          <Skeleton width={90} height={32} borderRadius={8} />
        </div>
      </div>
    </div>
  );
}

// ── Mirrors dashboard list row (team/project/position) ──
export function SkeletonDashboardRow() {
  return (
    <div style={{ borderRadius: 14, padding: "16px 20px", background: "var(--bg-card)", border: "1px solid var(--bg-card-border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Skeleton width={160} height={14} borderRadius={5} />
          <Skeleton width={60} height={18} borderRadius={5} />
        </div>
        <Skeleton width="85%" height={11} borderRadius={4} />
        <div style={{ display: "flex", gap: 5 }}>
          <Skeleton width={50} height={18} borderRadius={5} />
          <Skeleton width={44} height={18} borderRadius={5} />
          <Skeleton width={58} height={18} borderRadius={5} />
        </div>
      </div>
      <Skeleton width={32} height={32} borderRadius={7} />
    </div>
  );
}
