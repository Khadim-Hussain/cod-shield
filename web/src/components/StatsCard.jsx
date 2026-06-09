import { Card, Text, BlockStack } from "@shopify/polaris";

export default function StatsCard({ title, value, tone = "base", suffix = "" }) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text variant="bodySm" tone="subdued">{title}</Text>
        <Text variant="heading2xl" fontWeight="bold" tone={tone}>
          {value}{suffix}
        </Text>
      </BlockStack>
    </Card>
  );
}
