import { getNotes } from "@/lib/queries/notes";
import { getResources } from "@/lib/queries/resources";
import { getProjects } from "@/lib/queries/projects";
import { getPeople } from "@/lib/queries/people";
import { NotesContent } from "@/components/notes/notes-content";
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Note, Resource, Project, Person } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notes",
  description: "Connected personal notes, knowledge fragments, and contextual documentation.",
}

export default async function NotesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id

  const [notes, resources, projects, people] = await Promise.all([
    getNotes(userId),
    getResources(userId),
    getProjects(userId),
    getPeople(userId)
  ])

  return (
    <NotesContent
      initialNotes={notes as unknown as Note[]}
      resources={resources as unknown as Resource[]}
      projects={projects as unknown as Project[]}
      people={people as unknown as Person[]}
    />
  )
}
