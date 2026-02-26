const CF_ACCOUNT_ID =
  process.env.CF_ACCOUNT_ID || process.env.R2_ACCOUNT_ID || "";
const CF_KV_API_TOKEN = process.env.CF_KV_API_TOKEN || "";
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || "";

function isConfigured(): boolean {
  return !!(CF_ACCOUNT_ID && CF_KV_API_TOKEN && CF_KV_NAMESPACE_ID);
}

const KV_BASE = () =>
  `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}`;

export async function kvGet(key: string): Promise<string | null> {
  if (!isConfigured()) return null;

  try {
    const res = await fetch(`${KV_BASE()}/values/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${CF_KV_API_TOKEN}` },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function kvPut(
  key: string,
  value: string,
  expirationTtl?: number
): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    const url = new URL(`${KV_BASE()}/values/${encodeURIComponent(key)}`);
    if (expirationTtl) {
      url.searchParams.set("expiration_ttl", String(expirationTtl));
    }

    const res = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${CF_KV_API_TOKEN}`,
        "Content-Type": "text/plain",
      },
      body: value,
    });
    return res.ok;
  } catch {
    return false;
  }
}
