import * as React from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getCategories } from "@/lib/queries/categories";
import { QuickSaveContent } from "./quick-save-content"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function QuickSavePage({ searchParams }: PageProps) {
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

  if (embed) {
    return (
      <div className="w-full min-h-screen bg-background">
        <QuickSaveContent
          categories={categories}
          initialUrl={url}
          initialTitle={title}
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
        />
      </div>
    </div>
  )
}
