import { useEffect, useState } from "react";
import {
  Page, Card, FormLayout, TextField, Button, BlockStack,
  Banner, RangeSlider, Checkbox, Text, Divider,
} from "@shopify/polaris";

export default function Settings({ shop }) {
  const [settings, setSettings] = useState({
    whatsappPhoneId: "",
    whatsappToken: "",
    merchantWhatsapp: "",
    riskThreshold: 50,
    autoCancel: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/settings?shop=${shop}`)
      .then((r) => r.json())
      .then((d) => { if (d.settings) setSettings(d.settings); });
  }, [shop]);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, settings }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Page title="Settings">
      <BlockStack gap="500">
        {saved && <Banner tone="success" title="Settings saved successfully!" />}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">WhatsApp Configuration</Text>
            <Divider />
            <FormLayout>
              <TextField
                label="WhatsApp Phone Number ID"
                value={settings.whatsappPhoneId}
                onChange={(v) => setSettings({ ...settings, whatsappPhoneId: v })}
                helpText="From Meta Developer Dashboard → WhatsApp → Phone Numbers"
                autoComplete="off"
              />
              <TextField
                label="WhatsApp API Token"
                value={settings.whatsappToken}
                onChange={(v) => setSettings({ ...settings, whatsappToken: v })}
                type="password"
                helpText="Permanent token from Meta Business Suite"
                autoComplete="off"
              />
              <TextField
                label="Merchant WhatsApp Number (for alerts)"
                value={settings.merchantWhatsapp}
                onChange={(v) => setSettings({ ...settings, merchantWhatsapp: v })}
                placeholder="+923001234567"
                helpText="You will receive fraud alerts on this number"
                autoComplete="off"
              />
            </FormLayout>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Fraud Detection Settings</Text>
            <Divider />
            <RangeSlider
              label={`Risk Threshold: ${settings.riskThreshold}`}
              value={settings.riskThreshold}
              min={31}
              max={70}
              onChange={(v) => setSettings({ ...settings, riskThreshold: v })}
              helpText="Orders above this score will trigger WhatsApp confirmation"
            />
            <Checkbox
              label="Auto-cancel high risk orders (score 61+)"
              checked={settings.autoCancel}
              onChange={(v) => setSettings({ ...settings, autoCancel: v })}
              helpText="High risk orders will be automatically cancelled"
            />
          </BlockStack>
        </Card>

        <Button variant="primary" onClick={handleSave} loading={saving}>
          Save Settings
        </Button>
      </BlockStack>
    </Page>
  );
}
