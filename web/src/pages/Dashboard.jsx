import { useEffect, useState } from "react";
import { Page, Layout, BlockStack, InlineGrid, Card, Text, DataTable, Spinner } from "@shopify/polaris";
import StatsCard from "../components/StatsCard";

export default function Dashboard({ shop }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stats?shop=${shop}`)
      .then((r) => r.json())
      .then((d) => { setStats(d.stats || []); setLoading(false); });
  }, [shop]);

  const today = stats[0] || {};

  const weekRows = stats.map((s) => [
    s.date, s.totalOrders, s.fraudCaught,
    `Rs ${s.moneySaved?.toLocaleString() || 0}`,
    s.autoConfirmed, s.autoCancelled,
  ]);

  if (loading) return <Spinner />;

  return (
    <Page title="COD Shield Dashboard">
      <BlockStack gap="500">
        <InlineGrid columns={4} gap="400">
          <StatsCard title="Total Orders Today" value={today.totalOrders || 0} />
          <StatsCard title="Fraud Caught Today" value={today.fraudCaught || 0} tone="critical" />
          <StatsCard title="Money Saved (Rs)" value={(today.moneySaved || 0).toLocaleString()} tone="success" />
          <StatsCard title="Auto-Confirmed" value={today.autoConfirmed || 0} tone="success" />
        </InlineGrid>

        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd">Last 7 Days</Text>
            <DataTable
              columnContentTypes={["text","numeric","numeric","text","numeric","numeric"]}
              headings={["Date","Orders","Fraud","Saved","Confirmed","Cancelled"]}
              rows={weekRows}
            />
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
