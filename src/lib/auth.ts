import crypto from "crypto";

export const COOKIE_NAME = "admin_token";
const TOKEN_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return secret;
}

export function createToken(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(timestamp)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

export function verifyToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (now - ts > TOKEN_MAX_AGE) return false;

  // Check signature
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(timestamp)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
