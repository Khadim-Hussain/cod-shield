import { useEffect, useState } from "react";
import {
  Page, Layout, Card, BlockStack, Text, Button, Badge,
  InlineStack, Divider, Banner, Spinner,
} from "@shopify/polaris";

const PLANS = [
  {
    name: "Free",
    price: "0",
    limit: "50 orders/month",
    features: ["Basic fraud detection", "Email alerts", "Dashboard access"],
    tone: "subdued",
  },
  {
    name: "Starter",
    price: "Rs 2,500/month",
    limit: "500 orders/month",
    features: ["All Free features", "WhatsApp confirmation", "Auto-cancel", "7-day trial"],
    tone: "info",
    trial: "7-day free trial",
  },
  {
    name: "Pro",
    price: "Rs 6,000/month",
    limit: "Unlimited orders",
    features: ["All Starter features", "Merchant WhatsApp alerts", "Priority support", "7-day trial"],
    tone: "success",
    trial: "7-day free trial",
  },
];

export default function Billing({ shop }) {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    fetch(`/api/billing/status?shop=${shop}`)
      .then((r) => r.json())
      .then((d) => { setCurrentPlan(d.plan?.name || "Free"); setLoading(false); });
  }, [shop]);

  async function handleSubscribe(planName) {
    setSubscribing(planName);
    const res = await fetch("/api/billing/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, planName }),
    });
    const { confirmationUrl, plan } = await res.json();
    if (confirmationUrl) {
      window.top.location.href = confirmationUrl;
    } else if (plan) {
      setCurrentPlan(plan.name);
    }
    setSubscribing(null);
  }

  if (loading) return <Spinner />;

  return (
    <Page title="Billing & Plans">
      <BlockStack gap="500">
        <Banner tone="info" title={`Current Plan: ${currentPlan}`} />
        <Layout>
          {PLANS.map((plan) => (
            <Layout.Section variant="oneThird" key={plan.name}>
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingLg" fontWeight="bold">{plan.name}</Text>
                    {currentPlan === plan.name && <Badge tone="success">Current</Badge>}
                  </InlineStack>
                  <Text variant="heading2xl" tone="success">{plan.price}</Text>
                  <Text tone="subdued">{plan.limit}</Text>
                  {plan.trial && <Badge tone="warning">{plan.trial}</Badge>}
                  <Divider />
                  <BlockStack gap="200">
                    {plan.features.map((f) => (
                      <Text key={f}>✓ {f}</Text>
                    ))}
                  </BlockStack>
                  <Button
                    variant={currentPlan === plan.name ? "plain" : "primary"}
                    disabled={currentPlan === plan.name}
                    loading={subscribing === plan.name}
                    onClick={() => handleSubscribe(plan.name)}
                    fullWidth
                  >
                    {currentPlan === plan.name ? "Active Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </BlockStack>
              </Card>
            </Layout.Section>
          ))}
        </Layout>
      </BlockStack>
    </Page>
  );
}
