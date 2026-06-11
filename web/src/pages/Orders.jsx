import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import OrderTable from "../components/OrderTable";

const PAGE_SIZE = 20;
const T = { bg: "#060d1a", text: "#f1f5f9", sub: "#94a3b8", primary: "#3b82f6", border: "#1e2d45", card: "#0d1526" };

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

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "28px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <PackageSearch size={20} color={T.primary} strokeWidth={2} />
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: T.text, letterSpacing: "-0.03em" }}>Orders</h1>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: T.sub }}>{total} total orders tracked</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.primary}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <OrderTable
          orders={orders} filter={filter} onFilterChange={(f) => { setFilter(f); setPage(1); }}
          currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage}
        />
      )}
    </div>
  );
}
