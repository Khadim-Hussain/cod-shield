// PKT = UTC+5
function getPKTHour(isoDate) {
  const date = new Date(isoDate);
  return (date.getUTCHours() + 5) % 24;
}

export function calculateFraudScore(orderData, phoneHistory, addressHistory) {
  let score = 0;
  const reasons = [];

  const {
    total_price,
    phone,
    shipping_address,
    created_at,
    customer,
  } = orderData;

  const address = shipping_address?.address1 + " " + shipping_address?.city;

  // Rule 1: Same phone, 3+ different addresses → +40
  if (phoneHistory?.addresses?.length >= 3) {
    const uniqueAddresses = new Set(phoneHistory.addresses);
    if (uniqueAddresses.size >= 3 && !uniqueAddresses.has(address)) {
      score += 40;
      reasons.push("Same phone used with 3+ different addresses");
    }
  }

  // Rule 2: Order placed between 2am–5am PKT → +10
  const pktHour = getPKTHour(created_at);
  if (pktHour >= 2 && pktHour < 5) {
    score += 10;
    reasons.push("Order placed between 2am–5am PKT");
  }

  // Rule 3: Total > Rs 10,000 AND first order → +20
  if (parseFloat(total_price) > 10000 && (!customer?.orders_count || customer.orders_count <= 1)) {
    score += 20;
    reasons.push("High value order from new customer");
  }

  // Rule 4: Same address, 3+ different phones → +30
  if (addressHistory?.phones?.length >= 3) {
    const uniquePhones = new Set(addressHistory.phones);
    if (uniquePhones.size >= 3 && !uniquePhones.has(phone)) {
      score += 30;
      reasons.push("Same address used with 3+ different phone numbers");
    }
  }

  // Rule 5: Phone has previous cancelled/returned orders → +25
  if (phoneHistory?.cancelCount >= 1) {
    score += 25;
    reasons.push(`Phone has ${phoneHistory.cancelCount} previous cancelled order(s)`);
  }

  score = Math.min(score, 100);

  let level;
  if (score <= 30) level = "safe";
  else if (score <= 60) level = "suspicious";
  else level = "high_risk";

  return { score, level, reasons };
}
