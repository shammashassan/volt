import { getPersonById } from "@/lib/queries/people";
import { getResourcesByPersonId } from "@/lib/queries/resources";
import { getNotesByPersonId } from "@/lib/queries/notes";
import { PersonContent } from "@/components/people/person-content";
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { title: "Person" }
  const person = await getPersonById(id, session.user.id)
  if (!person) return { title: "Person" }
  return {
    title: person.name,
    description: person.notes || `Profile and connected resources for ${person.name} (${person.type})`,
  }
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  
  const [person, linkedResources, linkedNotes] = await Promise.all([
    getPersonById(id, userId),
    getResourcesByPersonId(id, userId),
    getNotesByPersonId(id, userId)
  ])

  if (!person) {
    notFound()
  }

  return (
    <PersonContent 
      person={person} 
      resources={linkedResources} 
      notes={linkedNotes} 
    />
  )
}
