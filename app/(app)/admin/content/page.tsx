import type { Metadata } from "next"
import { requireAdminMfa } from "@/lib/admin"
import { ContentReviewWorkspace } from "@/components/admin/content-review-workspace"

export const metadata: Metadata = { title: "Content review" }
export const dynamic = "force-dynamic"

export default async function AdminContentPage() {
  await requireAdminMfa()
  return <ContentReviewWorkspace />
}
