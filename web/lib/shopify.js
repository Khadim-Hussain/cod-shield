import crypto from "crypto";
import axios from "axios";

export function verifyWebhookHmac(rawBody, hmacHeader) {
  if (!hmacHeader) return false;
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_API_SECRET;
  if (!secret) return true; // skip if no secret configured
  const hash = crypto.createHmac("sha256", secret).update(Buffer.from(rawBody)).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}

function shopifyHeaders(accessToken) {
  return { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" };
}

export async function cancelOrder(shop, accessToken, orderId, reason = "fraud") {
  await axios.post(
    `https://${shop}/admin/api/2024-01/orders/${orderId}/cancel.json`,
    { reason },
    { headers: shopifyHeaders(accessToken) }
  );
}

export async function fulfillOrder(shop, accessToken, orderId) {
  const { data } = await axios.get(
    `https://${shop}/admin/api/2024-01/orders/${orderId}/fulfillment_orders.json`,
    { headers: shopifyHeaders(accessToken) }
  );
  const fulfillmentOrderId = data.fulfillment_orders?.[0]?.id;
  if (!fulfillmentOrderId) return;
  await axios.post(
    `https://${shop}/admin/api/2024-01/fulfillments.json`,
    { fulfillment: { line_items_by_fulfillment_order: [{ fulfillment_order_id: fulfillmentOrderId }] } },
    { headers: shopifyHeaders(accessToken) }
  );
}

export async function getShopAccessToken(shop) {
  const redis = (await import("./redis.js")).default;
  return await redis.get(`cod:token:${shop}`);
}

export async function saveShopAccessToken(shop, accessToken) {
  const redis = (await import("./redis.js")).default;
  await redis.set(`cod:token:${shop}`, accessToken);
}
