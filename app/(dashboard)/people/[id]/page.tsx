import { getPersonById, getResources, getNotes } from "@/lib/db"
import { PersonContent } from "./person-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  
  const [person, allResources, allNotes] = await Promise.all([
    getPersonById(id, userId),
    getResources(userId),
    getNotes(userId)
  ])

  if (!person) {
    notFound()
  }

  // Filter linked resources and notes
  const linkedResources = allResources.filter(r => r.personIds?.includes(id))
  const linkedNotes = allNotes.filter(n => n.relatedPeople?.includes(id))

  return (
    <PersonContent 
      person={person} 
      resources={linkedResources} 
      notes={linkedNotes} 
    />
  )
}
