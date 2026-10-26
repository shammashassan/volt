import Link from "next/link"
import { FileQuestion, Home } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 w-full">
      <div className="max-w-md w-full border border-border/50 bg-card p-8 sm:p-12 shadow-sm rounded-3xl flex flex-col items-center text-center gap-4">
        <div className="size-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-2">
          <FileQuestion className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Page Not Found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page or resource you requested could not be found. It may have been moved, deleted, or never existed.
          </p>
        </div>
        <div className="flex flex-row gap-3 pt-3">
          <Link
            href="/explore"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-xl font-bold gap-1.5")}
          >
            <Home className="size-4" />
            Explore
          </Link>
        </div>
      </div>
    </div>
  )
}
