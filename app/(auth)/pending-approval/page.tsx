"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { ClockIcon, LogOutIcon, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PendingApprovalPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<string>("")

  const checkStatus = async (isManual = false) => {
    if (isManual) {
      setChecking(true)
    }
    try {
      const { data: session } = await authClient.getSession({
        query: {
          disableCookieCache: true,
        },
      })

      setLastChecked(new Date().toLocaleTimeString())

      if (session?.user && (session.user as any).isApproved) {
        window.location.href = "/explore"
      }
    } catch (err) {
      console.error("Error checking approval status:", err)
    } finally {
      if (isManual) {
        setChecking(false)
      }
    }
  }

  useEffect(() => {
    // Initial check on mount
    void checkStatus()

    // Poll every 15 seconds
    const interval = setInterval(() => void checkStatus(), 15000)

    // Check when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void checkStatus()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

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
      <Card className="w-full max-w-md border-none shadow-2xl bg-background/60 backdrop-blur-xl text-center">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-2 animate-pulse">
            <ClockIcon className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Wait for Approval</CardTitle>
          <CardDescription className="text-base">
            Your account has been created successfully, but it needs to be approved by an administrator before you can access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a request to the admins. You&apos;ll be redirected automatically once they approve your application.
          </p>

          <div className="flex flex-col items-center justify-center gap-1.5 pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-amber-500"></span>
              </span>
              <span>Real-time status check active</span>
            </div>
            {lastChecked && (
              <span className="text-[10px] text-muted-foreground/60">
                Last checked: {lastChecked}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-4">
          <Button 
            className="w-full" 
            onClick={() => void checkStatus(true)} 
            disabled={checking}
          >
            {checking ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Checking Status...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Check Status
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
