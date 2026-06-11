import { useEffect, useState } from "react";
import {
  Package, AlertTriangle, BadgeDollarSign, CheckCircle2,
  TrendingUp, PieChart as PieIcon, BarChart3, CalendarDays,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const T = {
  bg:      "#060d1a",
  card:    "#0d1526",
  cardAlt: "#111827",
  border:  "#1e2d45",
  primary: "#3b82f6",
  blue2:   "#60a5fa",
  success: "#22c55e",
  danger:  "#ef4444",
  warning: "#f59e0b",
  purple:  "#a78bfa",
  text:    "#f1f5f9",
  sub:     "#94a3b8",
  muted:   "#475569",
};

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
      label: date.toLocaleDateString("en-PK", { weekday: "short", day: "numeric" }),
      totalOrders: d.orders, fraudCaught: d.fraud,
      moneySaved: d.saved, autoConfirmed: d.confirmed,
      autoCancelled: d.cancelled, safe: d.orders - d.fraud,
    };
  });
}

function StatCard({ Icon, iconColor, iconBg, label, value, sub }) {
  return (
    <div style={{
      background: T.card, borderRadius: "16px", padding: "22px 24px",
      border: `1px solid ${T.border}`, flex: 1,
      transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 14px", fontSize: "12px", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
          <p style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>{value}</p>
          {sub && <p style={{ margin: 0, fontSize: "12px", color: T.sub }}>{sub}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: "12px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color={iconColor} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ Icon, title, children }) {
  return (
    <div style={{ background: T.card, borderRadius: "16px", padding: "22px 24px", border: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <Icon size={16} color={T.primary} strokeWidth={2} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: T.text }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1e35", border: `1px solid ${T.border}`, borderRadius: "10px", padding: "12px 16px" }}>
      <p style={{ margin: "0 0 8px", fontWeight: 700, color: T.text, fontSize: "12px" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ margin: "3px 0", fontSize: "12px", color: p.color }}>
          {p.name}: <strong>{p.name === "Money Saved" ? `Rs ${Number(p.value).toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

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
          setStats(live.map((s) => ({
            ...s,
            label: new Date(s.date).toLocaleDateString("en-PK", { weekday: "short", day: "numeric" }),
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

  const totalOrders = stats.reduce((a, s) => a + (s.totalOrders || 0), 0);
  const totalFraud  = stats.reduce((a, s) => a + (s.fraudCaught || 0), 0);
  const totalSaved  = stats.reduce((a, s) => a + (s.moneySaved || 0), 0);
  const totalConf   = stats.reduce((a, s) => a + (s.autoConfirmed || 0), 0);
  const fraudRate   = totalOrders ? Math.round((totalFraud / totalOrders) * 100) : 0;
  const today       = stats[stats.length - 1] || {};

  const pieData = [
    { name: "Safe",  value: totalOrders - totalFraud, color: T.success },
    { name: "Fraud", value: totalFraud,               color: T.danger  },
  ];

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: T.bg }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.primary}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "28px 28px 40px", color: T.text, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: T.text, letterSpacing: "-0.03em" }}>Dashboard</h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: T.sub }}>
              {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          {usingMock && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", padding: "7px 14px" }}>
              <AlertTriangle size={13} color={T.warning} />
              <span style={{ fontSize: "12px", color: T.warning, fontWeight: 600 }}>Sample data — connect your store</span>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <StatCard Icon={Package}          iconColor={T.primary} iconBg="rgba(59,130,246,0.12)"  label="Weekly Orders"  value={totalOrders}                         sub={`Today: ${today.totalOrders || 0}`} />
        <StatCard Icon={AlertTriangle}    iconColor={T.danger}  iconBg="rgba(239,68,68,0.12)"   label="Fraud Caught"   value={totalFraud}                          sub={`${fraudRate}% fraud rate`} />
        <StatCard Icon={BadgeDollarSign}  iconColor={T.success} iconBg="rgba(34,197,94,0.12)"   label="Money Saved"    value={`Rs ${totalSaved.toLocaleString()}`}  sub="Last 7 days" />
        <StatCard Icon={CheckCircle2}     iconColor={T.purple}  iconBg="rgba(167,139,250,0.12)" label="Auto-Confirmed" value={totalConf}                            sub="Safe orders" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <ChartCard Icon={TrendingUp} title="Orders vs Fraud — Last 7 Days">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={stats}>
              <defs>
                <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={T.primary} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={T.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gFraud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={T.danger} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={T.danger} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: "12px", color: T.sub, paddingTop: "10px" }} />
              <Area type="monotone" dataKey="totalOrders" name="Total Orders" stroke={T.primary} fill="url(#gOrders)" strokeWidth={2.5} dot={{ fill: T.primary, r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="fraudCaught"  name="Fraud Caught" stroke={T.danger}  fill="url(#gFraud)"  strokeWidth={2.5} dot={{ fill: T.danger,  r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard Icon={PieIcon} title="Order Risk Distribution">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0d1e35", border: `1px solid ${T.border}`, borderRadius: "8px", color: T.text, fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "4px" }}>
            {pieData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: "12px", color: T.sub }}>{d.name} <strong style={{ color: T.text }}>{d.value}</strong></span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "14px" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: fraudRate > 20 ? T.danger : T.success }}>{fraudRate}%</span>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: T.muted }}>Fraud Rate</p>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <ChartCard Icon={BarChart3} title="Money Saved per Day (Rs)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="moneySaved" name="Money Saved" fill={T.success} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard Icon={BarChart3} title="Confirmed vs Cancelled Orders">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: "12px", color: T.sub }} />
              <Bar dataKey="autoConfirmed" name="Confirmed" fill={T.success} radius={[5, 5, 0, 0]} />
              <Bar dataKey="autoCancelled" name="Cancelled" fill={T.danger}  radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Table */}
      <div style={{ background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={16} color={T.primary} strokeWidth={2} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: T.text }}>Last 7 Days — Detailed Breakdown</p>
          </div>
          <span style={{ fontSize: "11px", color: T.muted, background: T.cardAlt, padding: "3px 10px", borderRadius: "6px", border: `1px solid ${T.border}` }}>
            {usingMock ? "Sample data" : "Live data"}
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0a1220" }}>
              {["Date", "Total Orders", "Fraud Caught", "Money Saved", "Confirmed", "Cancelled", "Fraud Rate"].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...stats].reverse().map((s, i) => {
              const rate = s.totalOrders ? Math.round((s.fraudCaught / s.totalOrders) * 100) : 0;
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.12s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#0f1c2e"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "13px 20px", fontWeight: 600, color: T.sub, fontSize: "13px" }}>{s.label || s.date}</td>
                  <td style={{ padding: "13px 20px", color: T.blue2, fontWeight: 700 }}>{s.totalOrders}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <span style={{ background: s.fraudCaught > 0 ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", color: s.fraudCaught > 0 ? T.danger : T.success, borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 700 }}>
                      {s.fraudCaught}
                    </span>
                  </td>
                  <td style={{ padding: "13px 20px", color: T.success, fontWeight: 700 }}>Rs {(s.moneySaved || 0).toLocaleString()}</td>
                  <td style={{ padding: "13px 20px", color: T.success, fontWeight: 600 }}>{s.autoConfirmed}</td>
                  <td style={{ padding: "13px 20px", color: T.danger,  fontWeight: 600 }}>{s.autoCancelled}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "56px", height: "5px", background: T.border, borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${rate}%`, height: "100%", background: rate > 20 ? T.danger : T.success }} />
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
