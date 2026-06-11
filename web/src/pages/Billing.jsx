import { useEffect, useState } from "react";
import { Spinner } from "@shopify/polaris";

const T = { bg: "#0f172a", card: "#1e293b", border: "#334155", text: "#f1f5f9", muted: "#94a3b8" };

const PLANS = [
  {
    name: "Free", price: "0", period: "", limit: "50 orders/month",
    features: ["Basic fraud detection", "Email alerts", "Dashboard access"],
    color: "#64748b", glow: "rgba(100,116,139,0.2)",
  },
  {
    name: "Starter", price: "Rs 2,500", period: "/month", limit: "500 orders/month",
    features: ["All Free features", "WhatsApp confirmation", "Auto-cancel orders", "7-day free trial"],
    color: "#6366f1", glow: "rgba(99,102,241,0.25)", trial: true,
  },
  {
    name: "Pro", price: "Rs 6,000", period: "/month", limit: "Unlimited orders",
    features: ["All Starter features", "Merchant WhatsApp alerts", "Priority support", "7-day free trial"],
    color: "#10b981", glow: "rgba(16,185,129,0.25)", trial: true, recommended: true,
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", background: T.bg }}>
      <Spinner size="large" />
    </div>
  );

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "24px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: "16px", padding: "24px 32px", marginBottom: "28px", border: "1px solid #4f46e5" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#fff" }}>💳 Billing & Plans</h1>
        <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
          Current plan: <strong style={{ color: "#a5b4fc" }}>{currentPlan}</strong>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.name;
          return (
            <div key={plan.name} style={{
              background: T.card, borderRadius: "16px",
              border: plan.recommended ? `2px solid ${plan.color}` : `1px solid ${T.border}`,
              overflow: "hidden", position: "relative",
              boxShadow: plan.recommended ? `0 0 30px ${plan.glow}` : "none",
              transform: plan.recommended ? "scale(1.02)" : "scale(1)",
              transition: "transform 0.2s",
            }}>
              {plan.recommended && (
                <div style={{ background: `linear-gradient(90deg, ${plan.color}, #059669)`, color: "#fff", textAlign: "center", padding: "7px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em" }}>
                  ⭐ MOST POPULAR
                </div>
              )}
              {isActive && (
                <div style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", textAlign: "center", padding: "7px", fontSize: "12px", fontWeight: 700 }}>
                  ✓ YOUR CURRENT PLAN
                </div>
              )}
              <div style={{ padding: "28px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: T.text }}>{plan.name}</span>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: plan.color, boxShadow: `0 0 8px ${plan.color}` }} />
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <span style={{ fontSize: "30px", fontWeight: 900, color: plan.color }}>{plan.price}</span>
                  <span style={{ fontSize: "14px", color: T.muted }}>{plan.period}</span>
                </div>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: T.muted }}>{plan.limit}</p>

                {plan.trial && (
                  <div style={{ display: "inline-block", background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid #f59e0b", borderRadius: "20px", padding: "3px 12px", fontSize: "11px", fontWeight: 700, marginBottom: "16px" }}>
                    🎉 7-day free trial
                  </div>
                )}

                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "16px", marginBottom: "24px" }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ color: plan.color, fontWeight: 800, fontSize: "14px" }}>✓</span>
                      <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleSubscribe(plan.name)} disabled={isActive || subscribing === plan.name}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                    background: isActive ? "#1e293b" : `linear-gradient(135deg, ${plan.color}, ${plan.color}99)`,
                    color: isActive ? T.muted : "#fff", fontWeight: 700, fontSize: "14px",
                    cursor: isActive ? "not-allowed" : "pointer",
                    boxShadow: isActive ? "none" : `0 4px 15px ${plan.glow}`,
                    transition: "all 0.2s",
                  }}>
                  {subscribing === plan.name ? "Processing..." : isActive ? "Active Plan" : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature comparison note */}
      <div style={{ marginTop: "28px", background: T.card, borderRadius: "14px", border: `1px solid ${T.border}`, padding: "20px 24px" }}>
        <p style={{ margin: "0 0 12px", fontWeight: 700, color: T.text, fontSize: "14px" }}>📋 All plans include:</p>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {["Shopify integration", "Redis order history", "Fraud score engine", "Auto-cancel rules", "Pakistani COD focus"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#10b981" }}>✓</span>
              <span style={{ fontSize: "13px", color: T.muted }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
