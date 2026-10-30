"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export function VerifyEmailView({ token }: { token: string }) {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMessage("No verification token was provided.")
      return
    }

    let isSubscribed = true

    const verify = async () => {
      try {
        const { error } = await authClient.verifyEmail({
          query: { token },
        })

        if (!isSubscribed) return

        if (error) {
          setStatus("error")
          setErrorMessage(error?.message || "Verification failed.")
        } else {
          setStatus("success")
        }
      } catch (err: unknown) {
        if (!isSubscribed) return
        setStatus("error")
        setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.")
      }
    }

    void verify()

    return () => {
      isSubscribed = false
    }
  }, [token])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>We are validating your email address</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying token with secure servers...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="size-12 text-emerald-500" />
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Email Verified!</h3>
              <p className="text-sm text-muted-foreground">
                Your email has been successfully verified. You can now sign in.
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="size-12 text-destructive" />
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-destructive">Verification Failed</h3>
              <p className="text-sm text-muted-foreground">
                {errorMessage || "The link may be invalid or expired."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/sign-in" className="text-xs text-primary hover:underline underline-offset-4">
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  )
}
