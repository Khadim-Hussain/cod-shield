const config = {
  safe:       { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", label: "Safe"      },
  suspicious: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "Suspicious" },
  high_risk:  { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", label: "High Risk"  },
};

export default function FraudBadge({ level }) {
  const c = config[level] || { bg: "#1e293b", color: "#64748b", label: level };
  return (
    <span style={{
      background: c.bg, color: c.color,
      borderRadius: "6px", padding: "3px 10px",
      fontSize: "12px", fontWeight: 700,
      display: "inline-block",
    }}>
      {c.label}
    </span>
  );
}
