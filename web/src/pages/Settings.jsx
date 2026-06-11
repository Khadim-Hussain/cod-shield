import { useEffect, useState } from "react";
import { SlidersHorizontal, MessageSquare, ShieldAlert, Save, Eye, EyeOff } from "lucide-react";

const T = { bg: "#060d1a", card: "#0d1526", border: "#1e2d45", text: "#f1f5f9", sub: "#94a3b8", muted: "#475569", primary: "#3b82f6", success: "#22c55e", danger: "#ef4444", warning: "#f59e0b" };

const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: "10px",
  border: `1.5px solid #1e2d45`, fontSize: "14px", color: T.text,
  background: "#07101f", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s", fontFamily: "inherit",
};

function Section({ Icon, title, children }) {
  return (
    <div style={{ background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: "16px" }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "10px", background: "#0a1220" }}>
        <Icon size={16} color={T.primary} strokeWidth={2} />
        <span style={{ fontWeight: 700, fontSize: "14px", color: T.text }}>{title}</span>
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
    </div>
  );
}

function Field({ label, help, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#cbd5e1", marginBottom: "7px" }}>{label}</label>
      {children}
      {help && <p style={{ margin: "6px 0 0", fontSize: "12px", color: T.muted }}>{help}</p>}
    </div>
  );
}

export default function Settings({ shop }) {
  const [s, setS] = useState({ whatsappPhoneId: "", whatsappToken: "", merchantWhatsapp: "", riskThreshold: 50, autoCancel: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    fetch(`/api/settings?shop=${shop}`).then((r) => r.json()).then((d) => { if (d.settings) setS(d.settings); });
  }, [shop]);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shop, settings: s }) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const upd = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const riskColor = s.riskThreshold > 55 ? T.danger : s.riskThreshold > 40 ? T.warning : T.success;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "28px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <SlidersHorizontal size={20} color={T.primary} strokeWidth={2} />
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: T.text, letterSpacing: "-0.03em" }}>Settings</h1>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: T.sub }}>Configure WhatsApp integration and fraud detection rules</p>
      </div>

      {saved && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", padding: "12px 18px", color: T.success, fontWeight: 600, fontSize: "13px", marginBottom: "16px" }}>
          <Save size={15} strokeWidth={2.5} /> Settings saved successfully
        </div>
      )}

      <Section Icon={MessageSquare} title="WhatsApp Configuration">
        <Field label="Phone Number ID" help="From Meta Developer Dashboard → WhatsApp → Phone Numbers">
          <input style={inputStyle} value={s.whatsappPhoneId} onChange={(e) => upd("whatsappPhoneId", e.target.value)}
            onFocus={(e) => e.target.style.borderColor = T.primary} onBlur={(e) => e.target.style.borderColor = "#1e2d45"} />
        </Field>
        <Field label="WhatsApp API Token" help="Permanent access token from Meta Business Suite">
          <div style={{ position: "relative" }}>
            <input style={{ ...inputStyle, paddingRight: "44px" }} type={showToken ? "text" : "password"} value={s.whatsappToken} onChange={(e) => upd("whatsappToken", e.target.value)}
              onFocus={(e) => e.target.style.borderColor = T.primary} onBlur={(e) => e.target.style.borderColor = "#1e2d45"} />
            <button onClick={() => setShowToken((v) => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field label="Merchant WhatsApp Number" help="You will receive high-risk fraud alerts on this number">
          <input style={inputStyle} placeholder="+923001234567" value={s.merchantWhatsapp} onChange={(e) => upd("merchantWhatsapp", e.target.value)}
            onFocus={(e) => e.target.style.borderColor = T.primary} onBlur={(e) => e.target.style.borderColor = "#1e2d45"} />
        </Field>
      </Section>

      <Section Icon={ShieldAlert} title="Fraud Detection Rules">
        <Field label="Risk Threshold" help="Orders above this score will trigger WhatsApp confirmation request">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "8px 0 4px" }}>
            <input type="range" min={31} max={70} value={s.riskThreshold} onChange={(e) => upd("riskThreshold", Number(e.target.value))}
              style={{ flex: 1, accentColor: riskColor, height: "4px", cursor: "pointer" }} />
            <div style={{ minWidth: "52px", textAlign: "center", background: "rgba(59,130,246,0.1)", border: `1px solid ${T.border}`, borderRadius: "8px", padding: "4px 10px" }}>
              <span style={{ fontWeight: 800, color: riskColor, fontSize: "16px" }}>{s.riskThreshold}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0", marginTop: "10px", borderRadius: "8px", overflow: "hidden", border: `1px solid ${T.border}` }}>
            {[["0–30", "Safe", T.success], ["31–60", "Suspicious", T.warning], ["61–100", "High Risk", T.danger]].map(([range, lbl, color]) => (
              <div key={range} style={{ flex: 1, padding: "7px 10px", textAlign: "center", background: "#07101f", borderRight: `1px solid ${T.border}` }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color }}>{range}</div>
                <div style={{ fontSize: "10px", color: T.muted, marginTop: "1px" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </Field>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px", background: "#07101f", borderRadius: "12px", border: `1px solid ${T.border}`, cursor: "pointer" }}
          onClick={() => upd("autoCancel", !s.autoCancel)}>
          <div style={{ width: 20, height: 20, borderRadius: "6px", border: `2px solid ${s.autoCancel ? T.primary : T.border}`, background: s.autoCancel ? T.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px", transition: "all 0.15s" }}>
            {s.autoCancel && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4L4 7L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: T.text, fontSize: "14px" }}>Auto-cancel high risk orders</p>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: T.muted }}>Orders with score 61+ will be automatically cancelled on Shopify</p>
          </div>
        </div>
      </Section>

      <button onClick={handleSave} disabled={saving} style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: saving ? "#1e3a5f" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
        color: "#fff", border: "none", borderRadius: "12px", padding: "13px 28px",
        fontSize: "14px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
        boxShadow: saving ? "none" : "0 4px 14px rgba(37,99,235,0.35)",
        transition: "all 0.2s", fontFamily: "inherit",
      }}>
        <Save size={16} strokeWidth={2.5} />
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
