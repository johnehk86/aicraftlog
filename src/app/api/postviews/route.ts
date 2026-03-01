export const runtime = "edge";

import { kvGet, kvPut } from "@/lib/kv";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + "_postview_salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return Response.json({ error: "slug is required" }, { status: 400 });
  }

  const totalStr = await kvGet(`postview:total:${slug}`);
  const total = totalStr ? parseInt(totalStr, 10) || 0 : 0;

  return Response.json({ total });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug = body?.slug;

  if (!slug || typeof slug !== "string") {
    return Response.json({ error: "slug is required" }, { status: 400 });
  }

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const today = getToday();
  const ipHash = await hashIP(ip);
  const ipKey = `postview:ip:${slug}:${today}:${ipHash}`;

  const alreadyViewed = await kvGet(ipKey);

  if (!alreadyViewed) {
    await kvPut(ipKey, "1", 86400);

    const currentTotal = parseInt(
      (await kvGet(`postview:total:${slug}`)) || "0",
      10
    );
    await kvPut(`postview:total:${slug}`, String(currentTotal + 1));
  }

  const totalStr = await kvGet(`postview:total:${slug}`);
  const total = totalStr ? parseInt(totalStr, 10) || 0 : 0;

  return Response.json({ total });
}
