/** Read a JSON request body with a hard byte limit before parsing it. */
export async function readJsonBody<T>(request: Request, maxBytes: number): Promise<T | null> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return null
  if (!request.body) return null

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
  } catch {
    try { await reader.cancel() } catch { /* The stream may already be closed. */ }
    return null
  } finally {
    reader.releaseLock()
  }

  try {
    const bytes = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    return JSON.parse(new TextDecoder().decode(bytes)) as T
  } catch {
    return null
  }
}
