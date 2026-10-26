import type { Metadata } from "next"
import { CommandsContent } from "@/components/dashboard/commands-content"

export const metadata: Metadata = {
  title: "CLI Commands",
  description: "Essential developer terminal starters, CLI commands, and database shortcuts.",
}

export default function CommandsPage() {
  return <CommandsContent />
}
