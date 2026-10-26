import type { Metadata } from "next"
import { AccountContent } from "@/components/dashboard/account-content"

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your personal profile, credentials, and account preferences.",
}

export default function AccountPage() {
  return <AccountContent />
}
