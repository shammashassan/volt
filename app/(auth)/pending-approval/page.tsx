"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { ClockIcon, LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PendingApprovalPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
          router.refresh()
        }
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md border-none shadow-2xl bg-background/60 backdrop-blur-xl text-center">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-2">
            <ClockIcon className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Wait for Approval</CardTitle>
          <CardDescription className="text-base">
            Your account has been created successfully, but it needs to be approved by an administrator before you can access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <p className="text-sm text-muted-foreground">
            We've sent a request to the admins. You'll be able to log in once they review your application.
          </p>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
