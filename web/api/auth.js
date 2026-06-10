import crypto from "crypto";
import axios from "axios";
import { saveShopAccessToken } from "../lib/shopify.js";

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL } = process.env;

const SCOPES = "read_orders,write_orders,read_fulfillments,write_fulfillments";

const WEBHOOKS = [
  { topic: "orders/create", path: "/api/webhook" },
  { topic: "orders/cancelled", path: "/api/webhook" },
];

async function registerWebhooks(shop, accessToken) {
  for (const wh of WEBHOOKS) {
    try {
      await axios.post(
        `https://${shop}/admin/api/2024-01/webhooks.json`,
        { webhook: { topic: wh.topic, address: `${SHOPIFY_APP_URL}${wh.path}`, format: "json" } },
        { headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" } }
      );
    } catch (e) {
      // webhook may already exist
    }
  }
}

export default async function handler(req, res) {
  const { pathname } = new URL(req.url, `https://${req.headers.host}`);

  // GET /api/auth — start OAuth
  if (pathname.endsWith("/auth")) {
    const { shop } = req.query;
    if (!shop) return res.status(400).json({ error: "Missing shop" });

    const state = crypto.randomBytes(16).toString("hex");
    const redirectUri = `${SHOPIFY_APP_URL}/api/auth/callback`;
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${redirectUri}&state=${state}`;

    res.setHeader("Set-Cookie", `shopify_state=${state}; HttpOnly; Secure; SameSite=None; Path=/`);
    return res.redirect(installUrl);
  }

  // GET /api/auth/callback — OAuth callback
  if (pathname.endsWith("/callback")) {
    const { shop, code, state } = req.query;
    const cookieState = req.headers.cookie?.match(/shopify_state=([^;]+)/)?.[1];

    if (!state || state !== cookieState) return res.status(403).json({ error: "Invalid state" });
    if (!shop || !code) return res.status(400).json({ error: "Missing params" });

    const { data } = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    });

    const accessToken = data.access_token;
    await saveShopAccessToken(shop, accessToken);
    await registerWebhooks(shop, accessToken);

    return res.redirect(`${SHOPIFY_APP_URL}?shop=${shop}`);
  }

  return res.status(404).json({ error: "Not found" });
}
