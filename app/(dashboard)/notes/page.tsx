import { getNotes, getResources, getProjects, getPeople } from "@/lib/db"
import { NotesContent } from "./notes-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Note, Resource, Project, Person } from "@/lib/types"




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
