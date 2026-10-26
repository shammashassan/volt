import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Volt account password.",
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  return <ResetPasswordForm token={token || ""} />
}
