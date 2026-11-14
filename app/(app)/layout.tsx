import { AppShell } from "@/app/app-shell"

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}


