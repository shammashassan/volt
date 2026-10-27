import { getResources } from "@/lib/queries/resources";
import { getNotes } from "@/lib/queries/notes";
import { getPeople } from "@/lib/queries/people";
import { TagsContent } from "@/components/tags/tags-content";
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse resources, notes, and people grouped by shared taxonomy and keywords.",
}

export default async function TagsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  
  const [resources, notes, people] = await Promise.all([
    getResources(userId),
    getNotes(userId),
    getPeople(userId)
  ])

  return (
    <TagsContent 
      resources={resources} 
      notes={notes} 
      people={people} 
    />
  )
}
