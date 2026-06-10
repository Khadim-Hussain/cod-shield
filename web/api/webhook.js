import { verifyWebhookHmac, cancelOrder, getShopAccessToken } from "../lib/shopify.js";
import { calculateFraudScore } from "../lib/scorer.js";
import { getPhoneHistory, updatePhoneHistory, getAddressHistory, updateAddressHistory, saveOrderResult, updateStats, incrementCancelCount, getSettings } from "../lib/redis.js";
import { sendWhatsAppConfirmation, sendMerchantAlert } from "./whatsapp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const hmac = req.headers["x-shopify-hmac-sha256"];
  const shop = req.headers["x-shopify-shop-domain"];
  const topic = req.headers["x-shopify-topic"];

  const rawBody = JSON.stringify(req.body);
  // TODO: re-enable HMAC after testing
  // if (!verifyWebhookHmac(rawBody, hmac)) return res.status(401).json({ error: "Unauthorized" });

  res.status(200).json({ received: true });

  try {
    const order = req.body;
    console.log("Webhook topic:", topic, "shop:", shop);
    console.log("Order id:", order.id, "phone:", order.phone, "billing phone:", order.billing_address?.phone);

    if (topic === "orders/cancelled") {
      const phone = order.phone || order.billing_address?.phone;
      if (phone) await incrementCancelCount(phone);
      return;
    }

    const { id, order_number, total_price, shipping_address, created_at, customer } = order;
    const phone = order.phone || order.billing_address?.phone || order.shipping_address?.phone;
    if (!phone) return;

    const address = `${shipping_address?.address1} ${shipping_address?.city}`;
    const [phoneHistory, addressHistory, settings] = await Promise.all([
      getPhoneHistory(phone), getAddressHistory(address), getSettings(shop),
    ]);

    const { score, level, reasons } = calculateFraudScore(
      { total_price, phone, shipping_address, created_at, customer }, phoneHistory, addressHistory
    );

    await Promise.all([
      saveOrderResult(id, { score, level, reasons, orderNumber: order_number, phone, total_price }, shop),
      updatePhoneHistory(phone, order, score),
      updateAddressHistory(address, phone),
    ]);

    const accessToken = await getShopAccessToken(shop);

    if (level === "safe") await updateStats(shop, { isFraud: false, autoConfirmed: true });

    if (level === "suspicious") {
      await updateStats(shop, { isFraud: true });
      await sendWhatsAppConfirmation({ phone, orderNumber: order_number, amount: total_price, orderId: id, shop, settings });
    }

    if (level === "high_risk") {
      await updateStats(shop, { isFraud: true, autoCancelled: true, moneySaved: parseFloat(total_price) });
      if (accessToken && settings.autoCancel !== false) await cancelOrder(shop, accessToken, id);
      await sendMerchantAlert({
        settings, orderNumber: order_number,
        customerName: customer?.first_name + " " + customer?.last_name,
        amount: total_price, score, reasons,
        action: settings.autoCancel !== false ? "Auto-cancelled" : "Manual review needed",
      });
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }
}
