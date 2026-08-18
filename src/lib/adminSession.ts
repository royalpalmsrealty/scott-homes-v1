// Signs/verifies the admin session cookie. Deliberately Web Crypto + btoa
// only — no Buffer, no node:crypto — so this file is safe to import from
// BOTH middleware.ts (Edge runtime) and Node route handlers. The admin
// password itself lives in Supabase (see adminAuth.ts) and is only checked
// once, at login; the session token this creates is what gets checked on
// every subsequent request, cheaply and without a database round-trip.
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function signExpiry(expiry: string, secret: string): Promise<string> {
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expiry));
  return bufferToBase64Url(signature);
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  const signature = await signExpiry(expiry, secret);
  return `${expiry}.${signature}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;
  if (!Number.isFinite(Number(expiry)) || Date.now() > Number(expiry)) return false;
  const expectedSignature = await signExpiry(expiry, secret);
  return signature === expectedSignature;
}
