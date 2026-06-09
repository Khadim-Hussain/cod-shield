import { useEffect, useState } from "react";
import { Page, Spinner } from "@shopify/polaris";
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

  if (loading) return <Spinner />;

  return (
    <Page title="Orders">
      <OrderTable
        orders={orders}
        filter={filter}
        onFilterChange={handleFilterChange}
        currentPage={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        onPageChange={setPage}
      />
    </Page>
  );
}
