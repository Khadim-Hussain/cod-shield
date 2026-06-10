import { getSettings, saveSettings } from "../lib/redis.js";

export default async function handler(req, res) {
  const { shop } = req.method === "GET" ? req.query : req.body;
  if (!shop) return res.status(400).json({ error: "Missing shop" });

  if (req.method === "GET") {
    const settings = await getSettings(shop);
    return res.status(200).json({ settings });
  }
  if (req.method === "POST") {
    const { settings } = req.body;
    await saveSettings(shop, settings);
    return res.status(200).json({ success: true });
  }
  return res.status(405).end();
}
