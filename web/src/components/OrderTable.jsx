import FraudBadge from "./FraudBadge";

const T = { bg: "#0f172a", card: "#1e293b", border: "#334155", text: "#f1f5f9", muted: "#94a3b8" };

const statusStyle = {
  pending:   { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24" },
  confirmed: { bg: "rgba(16,185,129,0.15)",  color: "#10b981" },
  cancelled: { bg: "rgba(244,63,94,0.15)",   color: "#f43f5e" },
  safe:      { bg: "rgba(16,185,129,0.15)",  color: "#10b981" },
};

function ScoreBar({ score }) {
  const color = score >= 61 ? "#f43f5e" : score >= 31 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "56px", height: "6px", background: T.border, borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "4px" }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: 800, color }}>{score}</span>
    </div>
  );
}

const filters = ["all", "safe", "suspicious", "high_risk"];
const flabel = (f) => f === "all" ? "All" : f === "high_risk" ? "High Risk" : f.charAt(0).toUpperCase() + f.slice(1);

export default function OrderTable({ orders, filter, onFilterChange, currentPage, totalPages, onPageChange }) {
  return (
    <div style={{ background: T.card, borderRadius: "14px", border: `1px solid ${T.border}`, overflow: "hidden" }}>
      {/* Filter bar */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, background: "#162032", display: "flex", gap: "8px" }}>
        {filters.map((f) => (
          <button key={f} onClick={() => onFilterChange(f)} style={{
            padding: "7px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none",
            background: filter === f ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#1e293b",
            color: filter === f ? "#fff" : T.muted, transition: "all 0.15s",
          }}>
            {flabel(f)}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", color: T.muted }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>📦</div>
          <p style={{ margin: 0 }}>No orders found.</p>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#162032" }}>
              {["Order #", "Customer", "Amount", "Score", "Risk", "Status", "Time"].map((h) => (
                <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => {
              const st = statusStyle[o.status] || { bg: "#1e293b", color: T.muted };
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1e2d42"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "13px 18px", fontWeight: 800, color: "#818cf8", fontSize: "13px" }}>#{o.orderNumber}</td>
                  <td style={{ padding: "13px 18px", color: T.text, fontSize: "13px" }}>{o.customerName || "—"}</td>
                  <td style={{ padding: "13px 18px", fontWeight: 700, color: T.text }}>Rs {o.total_price}</td>
                  <td style={{ padding: "13px 18px" }}><ScoreBar score={o.score} /></td>
                  <td style={{ padding: "13px 18px" }}><FraudBadge level={o.level} /></td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{ ...st, borderRadius: "20px", padding: "3px 11px", fontSize: "12px", fontWeight: 700 }}>{o.status}</span>
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: "12px", color: T.muted }}>
                    {new Date(o.createdAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
            style={{ padding: "7px 16px", borderRadius: "8px", border: `1px solid ${T.border}`, background: currentPage === 1 ? "#162032" : "#1e293b", cursor: currentPage === 1 ? "not-allowed" : "pointer", color: currentPage === 1 ? T.muted : T.text, fontWeight: 600, fontSize: "13px" }}>
            ← Prev
          </button>
          <span style={{ fontSize: "13px", color: T.muted }}>{currentPage} / {totalPages}</span>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
            style={{ padding: "7px 16px", borderRadius: "8px", border: `1px solid ${T.border}`, background: currentPage === totalPages ? "#162032" : "#1e293b", cursor: currentPage === totalPages ? "not-allowed" : "pointer", color: currentPage === totalPages ? T.muted : T.text, fontWeight: 600, fontSize: "13px" }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
