import { useEffect, useState } from "react";

const T = { bg: "#0f172a", card: "#1e293b", border: "#334155", text: "#f1f5f9", muted: "#94a3b8", primary: "#6366f1" };

function Section({ title, icon, children }) {
  return (
    <div style={{ background: T.card, borderRadius: "14px", border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: "20px" }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "8px", background: "#162032" }}>
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: "15px", color: T.text }}>{title}</span>
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: "10px",
  border: `1.5px solid #334155`, fontSize: "14px", color: T.text,
  background: "#0f172a", outline: "none", boxSizing: "border-box",
};

function Field({ label, help, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>{label}</label>
      {children}
      {help && <p style={{ margin: "5px 0 0", fontSize: "12px", color: T.muted }}>{help}</p>}
    </div>
  );
}

export default function Settings({ shop }) {
  const [s, setS] = useState({ whatsappPhoneId: "", whatsappToken: "", merchantWhatsapp: "", riskThreshold: 50, autoCancel: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "24px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: "16px", padding: "24px 32px", marginBottom: "24px", border: "1px solid #4f46e5" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#fff" }}>⚙️ Settings</h1>
        <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Configure WhatsApp & fraud detection rules</p>
      </div>

      {saved && (
        <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", borderRadius: "10px", padding: "12px 20px", color: "#10b981", fontWeight: 600, marginBottom: "20px" }}>
          ✓ Settings saved successfully!
        </div>
      )}

      <Section title="WhatsApp Configuration" icon="💬">
        <Field label="WhatsApp Phone Number ID" help="From Meta Developer Dashboard → WhatsApp → Phone Numbers">
          <input style={inputStyle} value={s.whatsappPhoneId} onChange={(e) => upd("whatsappPhoneId", e.target.value)} />
        </Field>
        <Field label="WhatsApp API Token" help="Permanent token from Meta Business Suite">
          <input style={inputStyle} type="password" value={s.whatsappToken} onChange={(e) => upd("whatsappToken", e.target.value)} />
        </Field>
        <Field label="Merchant WhatsApp Number" help="You will receive fraud alerts on this number">
          <input style={inputStyle} placeholder="+923001234567" value={s.merchantWhatsapp} onChange={(e) => upd("merchantWhatsapp", e.target.value)} />
        </Field>
      </Section>

      <Section title="Fraud Detection Rules" icon="🔍">
        <Field label={`Risk Threshold: ${s.riskThreshold}`} help="Orders above this score trigger WhatsApp confirmation">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "4px" }}>
            <input type="range" min={31} max={70} value={s.riskThreshold} onChange={(e) => upd("riskThreshold", Number(e.target.value))}
              style={{ flex: 1, accentColor: T.primary, height: "4px" }} />
            <span style={{ fontWeight: 800, color: T.primary, fontSize: "18px", minWidth: "36px" }}>{s.riskThreshold}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            {[["0-30","Safe","#10b981"], ["31-60","Suspicious","#f59e0b"], ["61-100","High Risk","#f43f5e"]].map(([r, l, c]) => (
              <div key={r} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: c, fontWeight: 700 }}>{r}</div>
                <div style={{ fontSize: "10px", color: T.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </Field>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", marginTop: "8px" }}>
          <div style={{ position: "relative", marginTop: "2px" }}>
            <input type="checkbox" checked={s.autoCancel} onChange={(e) => upd("autoCancel", e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: T.primary, cursor: "pointer" }} />
          </div>
          <div>
            <span style={{ fontWeight: 700, color: T.text, fontSize: "14px" }}>Auto-cancel high risk orders (score 61+)</span>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: T.muted }}>Orders above 61 will be automatically cancelled on Shopify</p>
          </div>
        </label>
      </Section>

      <button onClick={handleSave} disabled={saving} style={{
        background: saving ? "#4338ca" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "#fff", border: "none", borderRadius: "12px", padding: "14px 36px",
        fontSize: "15px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
        boxShadow: "0 4px 15px rgba(99,102,241,0.4)", transition: "all 0.2s",
      }}>
        {saving ? "Saving..." : "💾 Save Settings"}
      </button>
    </div>
  );
}
