"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, RotateCcw, Home } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Root application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full border border-border/50 bg-card p-8 shadow-2xl rounded-2xl flex flex-col items-center text-center gap-4">
        <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred. You can attempt to refresh the view or return to the dashboard.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono mt-2">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Button onClick={reset} variant="default" size="sm">
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}>
            <Home className="size-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
