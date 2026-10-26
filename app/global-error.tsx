"use client"

import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Critical root global error:", error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full border border-border/50 bg-card p-8 shadow-2xl rounded-2xl flex flex-col items-center text-center gap-4">
          <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="size-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Critical Application Error</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A critical failure interrupted the application shell. You can attempt to reload the session.
            </p>
            {error?.digest && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-muted/40 text-[11px] font-mono text-muted-foreground">
                <span>Ref:</span>
                <span className="text-foreground font-semibold">{error.digest}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Button onClick={reset} variant="default" size="sm" className="gap-2">
              <RotateCcw className="size-4" />
              Reload Application
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
