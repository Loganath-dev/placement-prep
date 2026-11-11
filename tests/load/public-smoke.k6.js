import http from "k6/http"
import { check, sleep } from "k6"

const baseUrl = (__ENV.BASE_URL || "").replace(/\/$/, "")
if (!baseUrl) throw new Error("Set BASE_URL to the deployed StudyBench origin.")

export const options = {
  stages: [
    { duration: "30s", target: 5 },
    { duration: "60s", target: 15 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1200", "p(99)<2500"],
  },
}

export default function () {
  const responses = http.batch([
    ["GET", `${baseUrl}/`, null, { tags: { route: "home" } }],
    ["GET", `${baseUrl}/faq`, null, { tags: { route: "faq" } }],
    ["GET", `${baseUrl}/api/questions?limit=20`, null, { tags: { route: "questions" } }],
  ])

  check(responses[0], { "home returns 200": (r) => r.status === 200 })
  check(responses[1], { "FAQ page returns 200": (r) => r.status === 200 })
  check(responses[2], { "question API returns 200": (r) => r.status === 200 })
  sleep(1)
}
