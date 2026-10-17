const encoder = new TextEncoder()

export async function hmacSha256Hex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  return bytesToHex(new Uint8Array(signature))
}

export function timingSafeStringEqual(a: string, b: string) {
  if (a.length !== b.length) return false

  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
