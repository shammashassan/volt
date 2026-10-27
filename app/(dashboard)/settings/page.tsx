import type { Metadata } from "next"
import { SettingsContent } from "@/components/dashboard/settings-content"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your personal profile, credentials, and account preferences.",
}

export default function SettingsPage() {
  return <SettingsContent />
}
