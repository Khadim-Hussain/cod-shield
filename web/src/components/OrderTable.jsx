import { DataTable, Card, BlockStack, Text, ButtonGroup, Button, Badge } from "@shopify/polaris";
import FraudBadge from "./FraudBadge";

const statusTone = { pending: "warning", confirmed: "success", cancelled: "critical", safe: "success" };

export default function OrderTable({ orders, filter, onFilterChange, currentPage, totalPages, onPageChange }) {
  const rows = orders.map((o) => [
    `#${o.orderNumber}`,
    o.customerName || "—",
    `Rs ${o.total_price}`,
    <Text fontWeight="bold">{o.score}/100</Text>,
    <FraudBadge level={o.level} />,
    <Badge tone={statusTone[o.status] || "info"}>{o.status}</Badge>,
    new Date(o.createdAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
  ]);

  return (
    <Card>
      <BlockStack gap="400">
        <ButtonGroup variant="segmented">
          {["all", "safe", "suspicious", "high_risk"].map((f) => (
            <Button key={f} pressed={filter === f} onClick={() => onFilterChange(f)}>
              {f === "all" ? "All" : f === "high_risk" ? "High Risk" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </ButtonGroup>

        {rows.length === 0 ? (
          <Text tone="subdued" alignment="center">No orders found.</Text>
        ) : (
          <DataTable
            columnContentTypes={["text","text","numeric","numeric","text","text","text"]}
            headings={["Order #","Customer","Amount","Score","Risk","Status","Time"]}
            rows={rows}
            hoverable
          />
        )}

        {totalPages > 1 && (
          <ButtonGroup>
            <Button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Previous</Button>
            <Text>{currentPage} / {totalPages}</Text>
            <Button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</Button>
          </ButtonGroup>
        )}
      </BlockStack>
    </Card>
  );
}
