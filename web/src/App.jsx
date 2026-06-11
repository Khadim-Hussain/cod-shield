import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";

const params = new URLSearchParams(window.location.search);
const shopFromUrl = params.get("shop");
if (shopFromUrl) localStorage.setItem("cod_shop", shopFromUrl);
const shop = shopFromUrl || localStorage.getItem("cod_shop") || "";

const NAV = [
  { path: "/",        label: "Dashboard", icon: "🛡️" },
  { path: "/orders",  label: "Orders",    icon: "📦" },
  { path: "/settings",label: "Settings",  icon: "⚙️" },
  { path: "/billing", label: "Billing",   icon: "💳" },
];

function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{
      width: "220px", minHeight: "100vh", background: "#0f172a",
      borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🛡️</div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, color: "#f1f5f9", fontSize: "15px" }}>COD Shield</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Fraud Detection</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {NAV.map((n) => {
          const active = pathname === n.path;
          return (
            <button key={n.path} onClick={() => navigate(n.path)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "11px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: active ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "transparent",
              color: active ? "#fff" : "#94a3b8",
              fontWeight: active ? 700 : 500, fontSize: "14px",
              marginBottom: "4px", transition: "all 0.15s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#f1f5f9"; }}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}>
              <span style={{ fontSize: "16px" }}>{n.icon}</span>
              {n.label}
              {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#a5b4fc" }} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
        <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>v1.0.0 · COD Shield</p>
        {shop && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shop}</p>}
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, overflowY: "auto" }}>
        <Routes>
          <Route path="/"         element={<Dashboard shop={shop} />} />
          <Route path="/orders"   element={<Orders    shop={shop} />} />
          <Route path="/settings" element={<Settings  shop={shop} />} />
          <Route path="/billing"  element={<Billing   shop={shop} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
