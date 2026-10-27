import type { Metadata } from "next"
import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import ResetPasswordLoading from "./loading"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Volt account password.",
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

async function ResetPasswordContent({ searchParams }: PageProps) {
  const { token } = await searchParams
  return <ResetPasswordForm token={token || ""} />
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  )
}
