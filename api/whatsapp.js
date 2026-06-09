import axios from "axios";
import { savePendingConfirmation, getPendingConfirmation, deletePendingConfirmation, updateOrderStatus, getSettings } from "../lib/redis.js";
import { fulfillOrder, cancelOrder, getShopAccessToken } from "../lib/shopify.js";

async function sendWhatsAppMessage(phoneId, token, to, message) {
  const phone = to.replace(/\D/g, "");
  await axios.post(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: message },
    },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
}

export async function sendWhatsAppConfirmation({ phone, orderNumber, amount, orderId, shop, settings }) {
  if (!settings?.whatsappPhoneId || !settings?.whatsappToken) return;

  const message = `Assalam o Alaikum! 🛍️ Aap ka order #${orderNumber} (Rs ${amount}) receive hua hai.\nOrder confirm karne ke liye *1* bhejein.\nCancel karne ke liye *2* bhejein.\nAap ke paas 30 minute hain.`;

  try {
    await sendWhatsAppMessage(settings.whatsappPhoneId, settings.whatsappToken, phone, message);
    await savePendingConfirmation(phone, { orderId, orderNumber, amount, shop });

    // Auto-cancel after 30 min if no reply
    setTimeout(async () => {
      const pending = await getPendingConfirmation(phone);
      if (pending) {
        await updateOrderStatus(orderId, "high_risk");
        const accessToken = await getShopAccessToken(shop);
        if (accessToken) await cancelOrder(shop, accessToken, orderId);
        await sendMerchantAlert({
          settings,
          orderNumber,
          customerName: "Customer",
          amount,
          score: "N/A",
          reasons: ["No WhatsApp reply in 30 minutes"],
          action: "Auto-cancelled (timeout)",
        });
        await deletePendingConfirmation(phone);
      }
    }, 30 * 60 * 1000);
  } catch (err) {
    console.error("WhatsApp send error:", err.message);
  }
}

export async function sendMerchantAlert({ settings, orderNumber, customerName, amount, score, reasons, action }) {
  if (!settings?.whatsappPhoneId || !settings?.whatsappToken || !settings?.merchantWhatsapp) return;

  const message = `⚠️ COD Shield Alert\nOrder #${orderNumber} suspicious hai.\nCustomer: ${customerName}\nAmount: Rs ${amount}\nFraud Score: ${score}/100\nReason: ${reasons.join(", ")}\nAction: ${action}`;

  try {
    await sendWhatsAppMessage(settings.whatsappPhoneId, settings.whatsappToken, settings.merchantWhatsapp, message);
  } catch (err) {
    console.error("Merchant alert error:", err.message);
  }
}

// Vercel serverless handler
export default async function handler(req, res) {
  // GET — WhatsApp webhook verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: "Forbidden" });
  }

  // POST — incoming message
  if (req.method === "POST") {
    res.status(200).json({ received: true });

    try {
      const entry = req.body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];
      if (!message) return;

      const from = message.from;
      const text = message.text?.body?.trim();
      const pending = await getPendingConfirmation(from);
      if (!pending) return;

      const settings = await getSettings(pending.shop);
      const accessToken = await getShopAccessToken(pending.shop);

      if (text === "1") {
        await updateOrderStatus(pending.orderId, "confirmed");
        await deletePendingConfirmation(from);
        if (accessToken) await fulfillOrder(pending.shop, accessToken, pending.orderId);
        await sendWhatsAppMessage(
          settings.whatsappPhoneId, settings.whatsappToken, from,
          `✅ Shukriya! Aap ka order #${pending.orderNumber} confirm ho gaya hai. Jald hi deliver hoga. 🚚`
        );
      } else if (text === "2") {
        await updateOrderStatus(pending.orderId, "cancelled");
        await deletePendingConfirmation(from);
        if (accessToken) await cancelOrder(pending.shop, accessToken, pending.orderId);
        await sendWhatsAppMessage(
          settings.whatsappPhoneId, settings.whatsappToken, from,
          `❌ Aap ka order #${pending.orderNumber} cancel ho gaya hai. Koi aur zaroorat ho toh humse rabta karein.`
        );
      }
    } catch (err) {
      console.error("WhatsApp webhook error:", err.message);
    }
  }
}
