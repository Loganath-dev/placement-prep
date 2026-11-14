/**
 * Runtime defense-in-depth for modules containing private curriculum data.
 * The transitive client import graph is also enforced by
 * scripts/check-client-content-boundary.mjs in CI; never import protected
 * content modules from a `use client` module or pass Premium bodies to client
 * components unless the server has first applied the current entitlement.
 */
if (typeof window !== "undefined") {
  throw new Error("A server-only StudyBench content module was imported by browser code.")
}
