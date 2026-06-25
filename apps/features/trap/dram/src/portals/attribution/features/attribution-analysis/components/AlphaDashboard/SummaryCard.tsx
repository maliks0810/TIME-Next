import React from "react";

interface SummaryCardProps {
  label: string;
  value: string;
  tone: "green" | "red" | "blue" | "purple";
}

const palette = {
  green: { color: "#10b981", bg: "#ecfdf5" },
  red: { color: "#ef4444", bg: "#fef2f2" },
  blue: { color: "#3b82f6", bg: "#eff6ff" },
  purple: { color: "#8b5cf6", bg: "#f5f3ff" },
};

export function SummaryCard({ label, value, tone }: SummaryCardProps) {
  const p = palette[tone];
  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${p.bg} 0%, #ffffff 100%)`,
        border: "1px solid #e2e8f0",
        borderRadius: 20,
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
        padding: 18,
        minHeight: 116,
      }}
    >
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>{label}</div>
      <div
        style={{
          marginTop: 12,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: p.color,
        }}
      >
        {value}
      </div>
    </div>
  );
}
