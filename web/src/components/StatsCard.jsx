import { Card, Text, BlockStack, InlineStack, Box } from "@shopify/polaris";

const toneStyles = {
  success: { bg: "#f0fdf4", border: "#86efac", color: "#16a34a" },
  critical: { bg: "#fff1f2", border: "#fca5a5", color: "#dc2626" },
  warning: { bg: "#fffbeb", border: "#fcd34d", color: "#d97706" },
  base: { bg: "#f8fafc", border: "#e2e8f0", color: "#334155" },
};

export default function StatsCard({ title, value, tone = "base", icon = "" }) {
  const style = toneStyles[tone] || toneStyles.base;
  return (
    <div style={{
      background: style.bg,
      border: `1.5px solid ${style.border}`,
      borderRadius: "12px",
      padding: "20px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <BlockStack gap="100">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="bodySm" tone="subdued">{title}</Text>
          {icon && <span style={{ fontSize: "20px" }}>{icon}</span>}
        </InlineStack>
        <Text variant="heading2xl" fontWeight="bold" as="p" style={{ color: style.color }}>
          {value}
        </Text>
      </BlockStack>
    </div>
  );
}
