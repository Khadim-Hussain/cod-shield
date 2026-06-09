import { getStats } from "../lib/redis.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { shop } = req.query;
  if (!shop) return res.status(400).json({ error: "Missing shop" });
  const stats = await getStats(shop, 7);
  return res.status(200).json({ stats });
}
