import * as React from "react"
import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { getCategories } from "@/lib/queries/categories"
import { fetchUrlMetadata } from "@/lib/services/metadata.service"
import { Skeleton } from "@/components/ui/skeleton"
import { QuickSaveContent } from "@/components/dashboard/quick-save-content";

export const metadata: Metadata = {
  title: "Quick Save",
  description: "Capture and save resources, links, and notes to your Volt workspace.",
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function QuickSaveSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/95 p-4 md:p-8">
      <div className="w-full max-w-[420px] rounded-2xl border border-border/80 bg-card/60 p-6 shadow-2xl backdrop-blur-xl">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

async function QuickSaveContentWrapper({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const resolvedSearchParams = await searchParams
  const url = typeof resolvedSearchParams.url === "string" ? resolvedSearchParams.url : ""
  const title = typeof resolvedSearchParams.title === "string" ? resolvedSearchParams.title : ""
  const embed = resolvedSearchParams.embed === "true"

  if (!session) {
    const callbackParams = new URLSearchParams()
    const targetUrl = `/quick-save?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}${embed ? "&embed=true" : ""}`
    callbackParams.set("callbackURL", targetUrl)
    redirect(`/login?${callbackParams.toString()}`)
  }

  const userId = session.user.id
  const categories = await getCategories(userId)

  let initialMetadata = null
  if (url && url.includes(".")) {
    try {
      initialMetadata = await fetchUrlMetadata(url)
    } catch {
      // silent fallback
    }
  }

  if (embed) {
    return (
      <div className="w-full min-h-screen bg-background overflow-y-auto">
        <QuickSaveContent
          categories={categories}
          initialUrl={url}
          initialTitle={title}
          initialMetadata={initialMetadata}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/95 p-4 md:p-8">
      <div className="w-full max-w-[420px] rounded-2xl border border-border/80 bg-card/60 shadow-2xl backdrop-blur-xl transition-all duration-300">
        <QuickSaveContent
          categories={categories}
          initialUrl={url}
          initialTitle={title}
          initialMetadata={initialMetadata}
        />
      </div>
    </div>
  )
}

export default function QuickSavePage(props: PageProps) {
  return (
    <Suspense fallback={<QuickSaveSkeleton />}>
      <QuickSaveContentWrapper {...props} />
    </Suspense>
  )
}
