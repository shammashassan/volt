import { getResources, getNotes, getPeople } from "@/lib/db"
import { TagsContent } from "./tags-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"


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
