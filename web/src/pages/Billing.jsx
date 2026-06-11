import { useEffect, useState } from "react";
import { CreditCard, Check, Zap, Star, Loader2 } from "lucide-react";

const T = { bg: "#060d1a", card: "#0d1526", border: "#1e2d45", text: "#f1f5f9", sub: "#94a3b8", muted: "#475569", primary: "#3b82f6", success: "#22c55e", warning: "#f59e0b" };

const PLANS = [
  {
    name: "Free", price: "0", period: "", limit: "50 orders/month",
    features: ["Basic fraud detection", "Email alerts", "Dashboard access"],
    color: "#64748b", border: "#1e2d45", Icon: null,
  },
  {
    name: "Starter", price: "Rs 2,500", period: "/month", limit: "500 orders/month",
    features: ["Everything in Free", "WhatsApp confirmation", "Auto-cancel orders", "7-day free trial"],
    color: "#3b82f6", border: "#1e3a5f", Icon: Zap, trial: true,
  },
  {
    name: "Pro", price: "Rs 6,000", period: "/month", limit: "Unlimited orders",
    features: ["Everything in Starter", "Merchant WhatsApp alerts", "Priority support", "7-day free trial"],
    color: "#a78bfa", border: "#2e1f5e", Icon: Star, trial: true, recommended: true,
  },
];

export default function Billing({ shop }) {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    fetch(`/api/billing/status?shop=${shop}`).then((r) => r.json())
      .then((d) => { setCurrentPlan(d.plan?.name || "Free"); setLoading(false); });
  }, [shop]);

  async function handleSubscribe(planName) {
    setSubscribing(planName);
    const res = await fetch("/api/billing/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, planName }),
    });
    const { confirmationUrl, plan } = await res.json();
    if (confirmationUrl) window.top.location.href = confirmationUrl;
    else if (plan) setCurrentPlan(plan.name);
    setSubscribing(null);
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: T.bg }}>
      <Loader2 size={28} color={T.primary} style={{ animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "28px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <CreditCard size={20} color={T.primary} strokeWidth={2} />
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: T.text, letterSpacing: "-0.03em" }}>Billing & Plans</h1>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: T.sub }}>
          Current plan: <span style={{ color: T.primary, fontWeight: 700 }}>{currentPlan}</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.name;
          return (
            <div key={plan.name} style={{
              background: T.card, borderRadius: "16px",
              border: plan.recommended ? `1.5px solid ${plan.color}` : `1px solid ${plan.border}`,
              overflow: "hidden", position: "relative",
              boxShadow: plan.recommended ? `0 0 28px rgba(167,139,250,0.15)` : "none",
              transform: plan.recommended ? "translateY(-4px)" : "none",
              transition: "transform 0.2s",
            }}>
              {plan.recommended && (
                <div style={{ background: "linear-gradient(90deg, #7c3aed, #a78bfa)", padding: "7px 0", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Most Popular</span>
                </div>
              )}

              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {plan.Icon && (
                      <div style={{ width: 34, height: 34, borderRadius: "10px", background: `${plan.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <plan.Icon size={16} color={plan.color} strokeWidth={2.5} />
                      </div>
                    )}
                    <span style={{ fontSize: "17px", fontWeight: 800, color: T.text }}>{plan.name}</span>
                  </div>
                  {isActive && (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(34,197,94,0.12)", color: T.success, border: "1px solid rgba(34,197,94,0.25)", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700 }}>
                      <Check size={11} strokeWidth={3} /> Active
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <span style={{ fontSize: "28px", fontWeight: 900, color: plan.color, letterSpacing: "-0.03em" }}>{plan.price}</span>
                  <span style={{ fontSize: "13px", color: T.muted }}>{plan.period}</span>
                </div>
                <p style={{ margin: "0 0 16px", fontSize: "12px", color: T.muted }}>{plan.limit}</p>

                {plan.trial && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(245,158,11,0.1)", color: T.warning, border: "1px solid rgba(245,158,11,0.25)", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, marginBottom: "16px" }}>
                    <Zap size={11} strokeWidth={2.5} /> 7-day free trial
                  </div>
                )}

                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "16px", marginBottom: "22px" }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${plan.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check size={10} color={plan.color} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleSubscribe(plan.name)} disabled={isActive || subscribing === plan.name}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "10px", border: "none",
                    background: isActive ? "#111827" : `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`,
                    color: isActive ? T.muted : "#fff", fontWeight: 700, fontSize: "13px",
                    cursor: isActive ? "not-allowed" : "pointer",
                    boxShadow: isActive ? "none" : `0 4px 14px ${plan.color}30`,
                    transition: "all 0.2s", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}>
                  {subscribing === plan.name
                    ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Processing...</>
                    : isActive ? "Current Plan"
                    : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: T.card, borderRadius: "14px", border: `1px solid ${T.border}`, padding: "18px 24px" }}>
        <p style={{ margin: "0 0 12px", fontWeight: 700, color: T.text, fontSize: "13px" }}>All plans include</p>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {["Shopify integration", "Redis order history", "Fraud score engine", "Auto-cancel rules", "Pakistani COD focus"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <Check size={13} color={T.success} strokeWidth={3} />
              <span style={{ fontSize: "13px", color: T.muted }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
