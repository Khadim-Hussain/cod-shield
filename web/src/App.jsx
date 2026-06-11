import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, PackageSearch, SlidersHorizontal, CreditCard, ShieldCheck } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";

const params = new URLSearchParams(window.location.search);
const shopFromUrl = params.get("shop");
if (shopFromUrl) localStorage.setItem("cod_shop", shopFromUrl);
const shop = shopFromUrl || localStorage.getItem("cod_shop") || "";

const NAV = [
  { path: "/",         label: "Dashboard", Icon: LayoutDashboard },
  { path: "/orders",   label: "Orders",    Icon: PackageSearch    },
  { path: "/settings", label: "Settings",  Icon: SlidersHorizontal},
  { path: "/billing",  label: "Billing",   Icon: CreditCard       },
];

function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{
      width: "240px", minHeight: "100vh",
      background: "#0a0f1e",
      borderRight: "1px solid #1a2236",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid #1a2236" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(59,130,246,0.4)",
          }}>
            <ShieldCheck size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, color: "#f8fafc", fontSize: "15px", letterSpacing: "-0.02em" }}>COD Shield</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#475569", fontWeight: 500 }}>Fraud Detection</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <p style={{ margin: "0 0 8px 10px", fontSize: "10px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em" }}>Menu</p>
        {NAV.map(({ path, label, Icon }) => {
          const active = pathname === path;
          return (
            <button key={path} onClick={() => navigate(path)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "11px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: active ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(29,78,216,0.15))" : "transparent",
              color: active ? "#60a5fa" : "#64748b",
              fontWeight: active ? 700 : 500, fontSize: "14px",
              marginBottom: "2px", transition: "all 0.15s", textAlign: "left",
              borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
            }}
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#94a3b8"; }}}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}}>
              <Icon size={17} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1a2236" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>Live · v1.0.0</p>
        </div>
        {shop && <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shop}</p>}
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div style={{ display: "flex", background: "#060d1a", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "240px", flex: 1, overflowY: "auto" }}>
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
