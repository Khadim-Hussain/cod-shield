import redis, { getOrderResult } from "../lib/redis.js";

const PAGE_SIZE = 20;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { shop, page = 1, filter = "all" } = req.query;
  if (!shop) return res.status(400).json({ error: "Missing shop" });

  try {
    // Get order index for this shop
    const indexKey = `cod:orderindex:${shop}`;
    const orderIds = await redis.lrange(indexKey, 0, -1);

    const orders = [];
    for (const id of orderIds) {
      const data = await redis.get(`cod:order:${id}`);
      if (data) {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (filter === "all" || parsed.level === filter) orders.push(parsed);
      }
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = orders.length;
    const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return res.status(200).json({ orders: paginated, total });
  } catch (err) {
    console.error("Orders API error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
