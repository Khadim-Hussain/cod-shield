const config = {
  safe:       { bg: "rgba(16,185,129,0.15)",  color: "#10b981", border: "#10b981", label: "✓ Safe"      },
  suspicious: { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b", border: "#f59e0b", label: "⚠ Suspicious" },
  high_risk:  { bg: "rgba(244,63,94,0.15)",   color: "#f43f5e", border: "#f43f5e", label: "✗ High Risk"  },
};

export default function FraudBadge({ level }) {
  const c = config[level] || { bg: "#1e293b", color: "#94a3b8", border: "#334155", label: level };
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: "20px", padding: "3px 11px", fontSize: "12px", fontWeight: 700,
    }}>
      {c.label}
    </span>
  );
}
