import type { Metadata } from "next"
import { VerifyEmailView } from "@/components/auth/verify-email-view"

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your Volt account email address.",
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  return <VerifyEmailView token={token || ""} />
}
