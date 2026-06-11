import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import FraudBadge from "./FraudBadge";

const T = { bg: "#060d1a", card: "#0d1526", border: "#1e2d45", text: "#f1f5f9", sub: "#94a3b8", muted: "#475569", primary: "#3b82f6", blue2: "#60a5fa", success: "#22c55e", danger: "#ef4444", warning: "#f59e0b" };

const statusStyle = {
  pending:   { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
  confirmed: { bg: "rgba(34,197,94,0.12)",   color: "#22c55e" },
  cancelled: { bg: "rgba(239,68,68,0.12)",   color: "#ef4444" },
  safe:      { bg: "rgba(34,197,94,0.12)",   color: "#22c55e" },
};

const FILTERS = ["all", "safe", "suspicious", "high_risk"];
const flabel = (f) => f === "all" ? "All" : f === "high_risk" ? "High Risk" : f.charAt(0).toUpperCase() + f.slice(1);

function ScoreBar({ score }) {
  const color = score >= 61 ? T.danger : score >= 31 ? T.warning : T.success;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "52px", height: "5px", background: T.border, borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "4px" }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: 800, color, minWidth: "28px" }}>{score}</span>
    </div>
  );
}

export default function OrderTable({ orders, filter, onFilterChange, currentPage, totalPages, onPageChange }) {
  return (
    <div style={{ background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`, overflow: "hidden" }}>
      {/* Filter bar */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, background: "#0a1220", display: "flex", gap: "6px" }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => onFilterChange(f)} style={{
            padding: "6px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
            border: filter === f ? "none" : `1px solid ${T.border}`,
            background: filter === f ? T.primary : "transparent",
            color: filter === f ? "#fff" : T.sub, transition: "all 0.15s", fontFamily: "inherit",
          }}>
            {flabel(f)}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: "72px", textAlign: "center" }}>
          <Package size={36} color={T.muted} style={{ marginBottom: "12px" }} />
          <p style={{ margin: 0, color: T.muted, fontSize: "14px" }}>No orders found</p>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0a1220" }}>
              {["Order #", "Customer", "Amount", "Score", "Risk", "Status", "Time"].map((h) => (
                <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => {
              const st = statusStyle[o.status] || { bg: T.card, color: T.sub };
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#0f1c2e"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "13px 18px", fontWeight: 800, color: T.blue2, fontSize: "13px" }}>#{o.orderNumber}</td>
                  <td style={{ padding: "13px 18px", color: T.text, fontSize: "13px" }}>{o.customerName || "—"}</td>
                  <td style={{ padding: "13px 18px", fontWeight: 700, color: T.text }}>Rs {o.total_price}</td>
                  <td style={{ padding: "13px 18px" }}><ScoreBar score={o.score} /></td>
                  <td style={{ padding: "13px 18px" }}><FraudBadge level={o.level} /></td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{ background: st.bg, color: st.color, borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 700 }}>{o.status}</span>
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
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 14px", borderRadius: "8px", border: `1px solid ${T.border}`, background: currentPage === 1 ? "transparent" : "#111827", cursor: currentPage === 1 ? "not-allowed" : "pointer", color: currentPage === 1 ? T.muted : T.sub, fontWeight: 600, fontSize: "12px", fontFamily: "inherit" }}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: "12px", color: T.muted, padding: "0 4px" }}>{currentPage} / {totalPages}</span>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 14px", borderRadius: "8px", border: `1px solid ${T.border}`, background: currentPage === totalPages ? "transparent" : "#111827", cursor: currentPage === totalPages ? "not-allowed" : "pointer", color: currentPage === totalPages ? T.muted : T.sub, fontWeight: 600, fontSize: "12px", fontFamily: "inherit" }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
