import { useEffect, useState } from "react";
import { Spinner } from "@shopify/polaris";
import OrderTable from "../components/OrderTable";

const PAGE_SIZE = 20;

export default function Orders({ shop }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orders?shop=${shop}&page=${page}&filter=${filter}`)
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setTotal(d.total || 0); setLoading(false); });
  }, [shop, page, filter]);

  const handleFilterChange = (f) => { setFilter(f); setPage(1); };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "24px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: "16px", padding: "24px 32px", marginBottom: "24px", border: "1px solid #4f46e5" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#fff" }}>📦 Orders</h1>
        <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>{total} total orders tracked</p>
      </div>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}><Spinner size="large" /></div>
      ) : (
        <OrderTable
          orders={orders} filter={filter} onFilterChange={handleFilterChange}
          currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage}
        />
      )}
    </div>
  );
}
