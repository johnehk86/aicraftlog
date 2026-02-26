export const runtime = "edge";

import { kvGet, kvPut } from "@/lib/kv";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + "_visitor_salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getCounts(): Promise<{ total: number; today: number }> {
  const [totalStr, todayStr] = await Promise.all([
    kvGet("visitor:total"),
    kvGet(`visitor:daily:${getToday()}`),
  ]);
  return {
    total: totalStr ? parseInt(totalStr, 10) || 0 : 0,
    today: todayStr ? parseInt(todayStr, 10) || 0 : 0,
  };
}

export async function GET() {
  const counts = await getCounts();
  return Response.json(counts);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const today = getToday();
  const ipHash = await hashIP(ip);
  const ipKey = `visitor:ip:${today}:${ipHash}`;

  // Check if this IP already visited today
  const alreadyVisited = await kvGet(ipKey);

  if (!alreadyVisited) {
    // Mark IP as visited (TTL: 24 hours)
    await kvPut(ipKey, "1", 86400);

    // Increment daily count
    const dailyKey = `visitor:daily:${today}`;
    const currentDaily = parseInt((await kvGet(dailyKey)) || "0", 10);
    await kvPut(dailyKey, String(currentDaily + 1), 172800); // TTL: 48 hours

    // Increment total count
    const currentTotal = parseInt((await kvGet("visitor:total")) || "0", 10);
    await kvPut("visitor:total", String(currentTotal + 1));
  }

  const counts = await getCounts();
  return Response.json(counts);
}
