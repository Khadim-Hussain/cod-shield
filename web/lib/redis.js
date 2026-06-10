import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const TTL_90_DAYS = 7776000;
const TTL_30_DAYS = 2592000;

export async function getPhoneHistory(phone) {
  try {
    const data = await redis.get(`cod:phone:${phone}`);
    return data || { orderCount: 0, addresses: [], cancelCount: 0, lastOrderAt: null, riskHistory: [] };
  } catch (e) {
    return { orderCount: 0, addresses: [], cancelCount: 0, lastOrderAt: null, riskHistory: [] };
  }
}

export async function updatePhoneHistory(phone, orderData, score) {
  try {
    const history = await getPhoneHistory(phone);
    const address = orderData.shipping_address?.address1 + " " + orderData.shipping_address?.city;
    history.orderCount = (history.orderCount || 0) + 1;
    history.addresses = [...new Set([...(history.addresses || []), address])];
    history.riskHistory = [...(history.riskHistory || []), score].slice(-20);
    history.lastOrderAt = new Date().toISOString();
    await redis.set(`cod:phone:${phone}`, JSON.stringify(history), { ex: TTL_90_DAYS });
  } catch (e) {}
}

export async function incrementCancelCount(phone) {
  try {
    const history = await getPhoneHistory(phone);
    history.cancelCount = (history.cancelCount || 0) + 1;
    await redis.set(`cod:phone:${phone}`, JSON.stringify(history), { ex: TTL_90_DAYS });
  } catch (e) {}
}

export async function getAddressHistory(address) {
  try {
    const key = `cod:address:${address.replace(/\s+/g, "_").toLowerCase()}`;
    const data = await redis.get(key);
    return data || { phones: [] };
  } catch (e) {
    return { phones: [] };
  }
}

export async function updateAddressHistory(address, phone) {
  try {
    const key = `cod:address:${address.replace(/\s+/g, "_").toLowerCase()}`;
    const history = await getAddressHistory(address);
    history.phones = [...new Set([...(history.phones || []), phone])];
    await redis.set(key, JSON.stringify(history), { ex: TTL_90_DAYS });
  } catch (e) {}
}

export async function saveOrderResult(orderId, result) {
  try {
    await redis.set(`cod:order:${orderId}`, JSON.stringify({
      ...result,
      status: result.level === "safe" ? "safe" : "pending",
      createdAt: new Date().toISOString(),
    }), { ex: TTL_30_DAYS });
  } catch (e) {}
}

export async function updateOrderStatus(orderId, status) {
  try {
    const order = await redis.get(`cod:order:${orderId}`);
    if (order) {
      const parsed = typeof order === "string" ? JSON.parse(order) : order;
      await redis.set(`cod:order:${orderId}`, JSON.stringify({ ...parsed, status }), { ex: TTL_30_DAYS });
    }
  } catch (e) {}
}

export async function getOrderResult(orderId) {
  try {
    const data = await redis.get(`cod:order:${orderId}`);
    return data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
  } catch (e) {
    return null;
  }
}

export async function updateStats(shopDomain, { isFraud, moneySaved, autoConfirmed, autoCancelled }) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = `cod:stats:${shopDomain}:${today}`;
    const stats = await redis.get(key) || { totalOrders: 0, fraudCaught: 0, moneySaved: 0, autoConfirmed: 0, autoCancelled: 0 };
    const parsed = typeof stats === "string" ? JSON.parse(stats) : stats;
    parsed.totalOrders += 1;
    if (isFraud) parsed.fraudCaught += 1;
    parsed.moneySaved += moneySaved || 0;
    if (autoConfirmed) parsed.autoConfirmed += 1;
    if (autoCancelled) parsed.autoCancelled += 1;
    await redis.set(key, JSON.stringify(parsed), { ex: TTL_30_DAYS });
  } catch (e) {}
}

export async function getStats(shopDomain, days = 7) {
  try {
    const results = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const key = `cod:stats:${shopDomain}:${dateStr}`;
      const data = await redis.get(key);
      results.push({ date: dateStr, ...(data ? (typeof data === "string" ? JSON.parse(data) : data) : { totalOrders: 0, fraudCaught: 0, moneySaved: 0, autoConfirmed: 0, autoCancelled: 0 }) });
    }
    return results;
  } catch (e) {
    return [];
  }
}

export async function saveSettings(shopDomain, settings) {
  try {
    await redis.set(`cod:settings:${shopDomain}`, JSON.stringify(settings));
  } catch (e) {}
}

export async function getSettings(shopDomain) {
  try {
    const data = await redis.get(`cod:settings:${shopDomain}`);
    return data ? (typeof data === "string" ? JSON.parse(data) : data) : {
      whatsappPhoneId: "", whatsappToken: "", merchantWhatsapp: "", riskThreshold: 50, autoCancel: true,
    };
  } catch (e) {
    return {};
  }
}

export async function savePlan(shopDomain, plan) {
  try { await redis.set(`cod:plan:${shopDomain}`, JSON.stringify(plan)); } catch (e) {}
}

export async function getPlan(shopDomain) {
  try {
    const data = await redis.get(`cod:plan:${shopDomain}`);
    return data ? (typeof data === "string" ? JSON.parse(data) : data) : { name: "Free", limit: 50 };
  } catch (e) {
    return { name: "Free", limit: 50 };
  }
}

export async function savePendingConfirmation(phone, orderData) {
  try { await redis.set(`cod:pending:${phone}`, JSON.stringify({ ...orderData, sentAt: Date.now() }), { ex: 1800 }); } catch (e) {}
}

export async function getPendingConfirmation(phone) {
  try {
    const data = await redis.get(`cod:pending:${phone}`);
    return data ? (typeof data === "string" ? JSON.parse(data) : data) : null;
  } catch (e) { return null; }
}

export async function deletePendingConfirmation(phone) {
  try { await redis.del(`cod:pending:${phone}`); } catch (e) {}
}

export async function getShopAccessToken(shop) {
  try { return await redis.get(`cod:token:${shop}`); } catch (e) { return null; }
}

export default redis;
