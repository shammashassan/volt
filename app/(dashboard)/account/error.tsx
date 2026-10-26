"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Account settings error:", error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[400px]">
      <div className="max-w-md w-full border border-border/50 bg-card/60 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center text-center gap-4 shadow-xl">
        <div className="size-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Failed to load account settings</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred while loading your profile and security credentials.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono mt-1">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Button onClick={reset} size="sm" className="gap-2">
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <Link href="/explore" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}>
            <ArrowLeft className="size-4" />
            Explore
          </Link>
        </div>
      </div>
    </div>
  )
}
