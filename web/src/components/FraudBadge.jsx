import { Badge } from "@shopify/polaris";

const toneMap = {
  safe: "success",
  suspicious: "warning",
  high_risk: "critical",
};

const labelMap = {
  safe: "✓ Safe",
  suspicious: "⚠ Suspicious",
  high_risk: "✗ High Risk",
};

export default function FraudBadge({ level }) {
  return (
    <Badge tone={toneMap[level] || "info"}>
      {labelMap[level] || level}
    </Badge>
  );
}
