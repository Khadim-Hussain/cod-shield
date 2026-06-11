import { useEffect, useState } from "react";
import { Spinner } from "@shopify/polaris";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Theme ───────────────────────────────────────────────────────────────────
const T = {
  primary:   "#6366f1",   // indigo
  success:   "#10b981",   // emerald
  danger:    "#f43f5e",   // rose
  warning:   "#f59e0b",   // amber
  dark:      "#0f172a",
  card:      "#1e293b",
  border:    "#334155",
  muted:     "#94a3b8",
  text:      "#f1f5f9",
  subtext:   "#cbd5e1",
  bg:        "#0f172a",
};

// ─── Mock realistic 7-day data ───────────────────────────────────────────────
function generateMockStats() {
  const base = [
    { orders: 42, fraud: 8,  saved: 34500, confirmed: 30, cancelled: 8  },
    { orders: 37, fraud: 5,  saved: 21000, confirmed: 28, cancelled: 5  },
    { orders: 55, fraud: 12, saved: 67800, confirmed: 38, cancelled: 12 },
    { orders: 29, fraud: 3,  saved: 12400, confirmed: 24, cancelled: 3  },
    { orders: 63, fraud: 14, saved: 89200, confirmed: 44, cancelled: 14 },
    { orders: 48, fraud: 9,  saved: 43600, confirmed: 35, cancelled: 9  },
    { orders: 71, fraud: 17, saved: 112000,confirmed: 50, cancelled: 17 },
  ];
  return base.map((d, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" }),
      totalOrders: d.orders,
      fraudCaught: d.fraud,
      moneySaved: d.saved,
      autoConfirmed: d.confirmed,
      autoCancelled: d.cancelled,
      safe: d.orders - d.fraud,
    };
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: T.card, borderRadius: "14px", padding: "22px 24px",
      border: `1px solid ${T.border}`, flex: 1,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, fontSize: "12px", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
          <p style={{ margin: "8px 0 4px", fontSize: "28px", fontWeight: 800, color: T.text }}>{value}</p>
          {sub && <p style={{ margin: 0, fontSize: "12px", color: T.muted }}>{sub}</p>}
        </div>
        <span style={{ fontSize: "28px", opacity: 0.8 }}>{icon}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "12px 16px" }}>
      <p style={{ margin: "0 0 8px", fontWeight: 700, color: T.text, fontSize: "13px" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ margin: "3px 0", fontSize: "12px", color: p.color }}>
          {p.name}: <strong>{p.name === "Money Saved" ? `Rs ${p.value.toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ shop }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    fetch(`/api/stats?shop=${shop}`)
      .then((r) => r.json())
      .then((d) => {
        const live = d.stats || [];
        const hasData = live.some((s) => s.totalOrders > 0);
        if (hasData) {
          setStats(live.map((s, i) => ({
            ...s,
            label: new Date(s.date).toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" }),
            safe: (s.totalOrders || 0) - (s.fraudCaught || 0),
          })).reverse());
        } else {
          setStats(generateMockStats());
          setUsingMock(true);
        }
        setLoading(false);
      })
      .catch(() => { setStats(generateMockStats()); setUsingMock(true); setLoading(false); });
  }, [shop]);

  const today = stats[stats.length - 1] || {};
  const totalWeekOrders = stats.reduce((a, s) => a + (s.totalOrders || 0), 0);
  const totalWeekFraud  = stats.reduce((a, s) => a + (s.fraudCaught || 0), 0);
  const totalWeekSaved  = stats.reduce((a, s) => a + (s.moneySaved || 0), 0);
  const fraudRate = totalWeekOrders ? Math.round((totalWeekFraud / totalWeekOrders) * 100) : 0;

  const pieData = [
    { name: "Safe",      value: totalWeekOrders - totalWeekFraud, color: T.success },
    { name: "Fraud",     value: totalWeekFraud,                   color: T.danger  },
  ];

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", background: T.bg }}>
      <Spinner size="large" />
    </div>
  );

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "24px", color: T.text, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0f172a 100%)",
        borderRadius: "16px", padding: "28px 32px", marginBottom: "24px",
        border: "1px solid #4f46e5", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -50, right: 80, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#fff" }}>🛡️ COD Shield Dashboard</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
            Real-time fraud detection · Pakistani COD stores
          </p>
          {usingMock && (
            <span style={{ display: "inline-block", marginTop: "10px", background: "rgba(245,158,11,0.2)", color: "#fbbf24", border: "1px solid #f59e0b", borderRadius: "20px", padding: "3px 12px", fontSize: "11px", fontWeight: 600 }}>
              📊 Sample data shown — connect your store to see real stats
            </span>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <StatCard icon="📦" label="This Week Orders" value={totalWeekOrders} sub={`Today: ${today.totalOrders || 0}`} color={T.primary} />
        <StatCard icon="🚨" label="Fraud Caught" value={totalWeekFraud} sub={`${fraudRate}% fraud rate`} color={T.danger} />
        <StatCard icon="💰" label="Money Saved" value={`Rs ${totalWeekSaved.toLocaleString()}`} sub="Last 7 days" color={T.success} />
        <StatCard icon="✅" label="Auto-Confirmed" value={stats.reduce((a, s) => a + (s.autoConfirmed || 0), 0)} sub="Safe orders" color={T.warning} />
      </div>

      {/* ── Charts Row 1 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>

        {/* Area Chart — Orders vs Fraud */}
        <div style={{ background: T.card, borderRadius: "14px", padding: "24px", border: `1px solid ${T.border}` }}>
          <p style={{ margin: "0 0 20px", fontWeight: 700, fontSize: "15px", color: T.text }}>📈 Orders vs Fraud — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats}>
              <defs>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.danger} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.danger} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: T.muted, fontSize: "12px" }} />
              <Area type="monotone" dataKey="totalOrders" name="Total Orders" stroke={T.primary} fill="url(#ordersGrad)" strokeWidth={2.5} dot={{ fill: T.primary, r: 4 }} />
              <Area type="monotone" dataKey="fraudCaught"  name="Fraud Caught"  stroke={T.danger}  fill="url(#fraudGrad)"  strokeWidth={2.5} dot={{ fill: T.danger, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Safe vs Fraud */}
        <div style={{ background: T.card, borderRadius: "14px", padding: "24px", border: `1px solid ${T.border}` }}>
          <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: "15px", color: T.text }}>🥧 Order Risk Split</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "8px", color: T.text }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "8px" }}>
            {pieData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: "12px", color: T.muted }}>{d.name}: <strong style={{ color: T.text }}>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

        {/* Bar Chart — Money Saved */}
        <div style={{ background: T.card, borderRadius: "14px", padding: "24px", border: `1px solid ${T.border}` }}>
          <p style={{ margin: "0 0 20px", fontWeight: 700, fontSize: "15px", color: T.text }}>💰 Money Saved per Day (Rs)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="moneySaved" name="Money Saved" fill={T.success} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart — Confirmed vs Cancelled */}
        <div style={{ background: T.card, borderRadius: "14px", padding: "24px", border: `1px solid ${T.border}` }}>
          <p style={{ margin: "0 0 20px", fontWeight: 700, fontSize: "15px", color: T.text }}>✅ Confirmed vs ❌ Cancelled</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: T.muted, fontSize: "12px" }} />
              <Bar dataKey="autoConfirmed" name="Confirmed" fill={T.success}  radius={[6, 6, 0, 0]} />
              <Bar dataKey="autoCancelled" name="Cancelled" fill={T.danger}   radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Last 7 Days Table ── */}
      <div style={{ background: T.card, borderRadius: "14px", border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: T.text }}>📅 Last 7 Days — Detailed Breakdown</p>
          <span style={{ fontSize: "12px", color: T.muted }}>{usingMock ? "Sample data" : "Live data"}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#162032" }}>
              {["Date", "Total Orders", "Fraud Caught", "Money Saved", "Confirmed", "Cancelled", "Fraud %"].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...stats].reverse().map((s, i) => {
              const rate = s.totalOrders ? Math.round((s.fraudCaught / s.totalOrders) * 100) : 0;
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1e2d42"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "13px 20px", fontWeight: 600, color: T.subtext, fontSize: "13px" }}>{s.label || s.date}</td>
                  <td style={{ padding: "13px 20px", color: T.primary, fontWeight: 700 }}>{s.totalOrders}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <span style={{ background: s.fraudCaught > 0 ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)", color: s.fraudCaught > 0 ? "#f43f5e" : T.success, borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>
                      {s.fraudCaught}
                    </span>
                  </td>
                  <td style={{ padding: "13px 20px", color: T.success, fontWeight: 700 }}>Rs {(s.moneySaved || 0).toLocaleString()}</td>
                  <td style={{ padding: "13px 20px", color: T.success }}>{s.autoConfirmed}</td>
                  <td style={{ padding: "13px 20px", color: T.danger }}>{s.autoCancelled}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "50px", height: "6px", background: T.border, borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${rate}%`, height: "100%", background: rate > 20 ? T.danger : T.success, borderRadius: "4px" }} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: rate > 20 ? T.danger : T.success }}>{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
