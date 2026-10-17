/**
 * Content-derived stable IDs for the hand-authored question banks.
 *
 * Earlier these banks numbered questions with a running counter (q1, q2, ...).
 * Inserting or reordering a single entry renumbered every question after it, so
 * any stored reference to a question id (e.g. a saved mistake) silently pointed
 * at a different question after the next content edit.
 *
 * Deriving the id from the question's own text fixes that: an id only changes if
 * that question's wording changes, never because a neighbour moved. The hash is a
 * 64-bit FNV-1a (two interleaved 32-bit lanes) rendered in base36 - wide enough
 * that accidental collisions across a few thousand questions are vanishingly
 * unlikely. The factory still disambiguates the rare genuine collision (or an
 * intentionally duplicated question) with a deterministic -2, -3, ... suffix.
 */

// ASCII unit separator (char 31) joins identity fields so field boundaries can't
// blur: "ab" + "c" must not hash the same as "a" + "bc".
const SEP = String.fromCharCode(31)

function hash64(input: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0xc2b2ae35
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193)
    h2 = Math.imul(h2 ^ c, 0x85ebca6b)
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)
}

/** Join the identity-defining fields into a single hashable key. */
export function idKey(...parts: (string | number)[]): string {
  return parts.join(SEP)
}

/**
 * Build an id generator namespaced by `prefix`. Each call returns a stable id for
 * the given key; identical keys within the same factory get distinct suffixed ids
 * in call order, so a duplicated question never collapses onto another's id.
 */
export function createStableIdFactory(prefix: string): (key: string) => string {
  const used = new Set<string>()
  return (key: string): string => {
    const base = `${prefix}-${hash64(key)}`
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    return id
  }
}
