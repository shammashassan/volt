import { getProjectById, getResources, getNotes } from "@/lib/db"
import { ProjectContent } from "./project-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  
  const [project, allResources, allNotes] = await Promise.all([
    getProjectById(id, userId),
    getResources(userId),
    getNotes(userId)
  ])

  if (!project) {
    notFound()
  }

  // Filter linked resources and notes
  const linkedResources = allResources.filter(r => r.projectIds?.includes(id))
  const linkedNotes = allNotes.filter(n => n.relatedProjects?.includes(id))

  return (
    <ProjectContent 
      project={project} 
      resources={linkedResources} 
      notes={linkedNotes} 
    />
  )
}
