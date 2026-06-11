import axios from "axios";
import { savePlan, getPlan, getShopAccessToken } from "../lib/redis.js";

export const PLANS = {
  Free: { name: "Free", price: 0, limit: 50, trialDays: 0 },
  Starter: { name: "Starter", price: 2500, limit: 500, trialDays: 7, currencyCode: "PKR" },
  Pro: { name: "Pro", price: 6000, limit: 999999, trialDays: 7, currencyCode: "PKR" },
};

export default async function handler(req, res) {
  const url = req.url || req.query.path || "";

  if (req.method === "GET" && url.includes("/status")) {
    const shop = req.query.shop;
    if (!shop) return res.status(400).json({ error: "Missing shop" });
    const plan = await getPlan(shop);
    return res.status(200).json({ plan });
  }

  if (req.method === "POST" && url.includes("/subscribe")) {
    const { shop, planName } = req.body;
    if (!shop || !planName) return res.status(400).json({ error: "Missing shop or planName" });
    const plan = PLANS[planName];
    if (!plan) return res.status(400).json({ error: "Invalid plan" });
    if (plan.price === 0) {
      await savePlan(shop, plan);
      return res.status(200).json({ plan, redirectUrl: null });
    }
    const accessToken = await getShopAccessToken(shop);
    if (!accessToken) return res.status(401).json({ error: "No access token" });
    const mutation = `
      mutation CreateSubscription($name: String!, $price: Decimal!, $returnUrl: URL!, $trialDays: Int) {
        appSubscriptionCreate(name: $name returnUrl: $returnUrl trialDays: $trialDays test: ${process.env.NODE_ENV !== "production"}
          lineItems: [{ plan: { appRecurringPricingDetails: { price: { amount: $price, currencyCode: PKR } interval: EVERY_30_DAYS } } }]
        ) { confirmationUrl userErrors { field message } }
      }
    `;
    const { data } = await axios.post(
      `https://${shop}/admin/api/2025-07/graphql.json`,
      { query: mutation, variables: { name: plan.name, price: plan.price, returnUrl: `${process.env.SHOPIFY_APP_URL}/api/billing/callback?shop=${shop}&plan=${planName}`, trialDays: plan.trialDays } },
      { headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" } }
    );
    return res.status(200).json({ confirmationUrl: data?.data?.appSubscriptionCreate?.confirmationUrl });
  }

  if (req.method === "GET" && url.includes("/callback")) {
    const { shop, plan: planName, charge_id } = req.query;
    if (shop && planName) await savePlan(shop, { ...PLANS[planName], chargeId: charge_id });
    return res.redirect(`${process.env.SHOPIFY_APP_URL}?shop=${shop}&billing=success`);
  }

  return res.status(404).json({ error: "Not found" });
}
