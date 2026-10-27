import { getProjectById } from "@/lib/queries/projects";
import { getResourcesByProjectId } from "@/lib/queries/resources";
import { getNotesByProjectId } from "@/lib/queries/notes";
import { ProjectContent } from "@/components/projects/project-content";
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
  if (!session) return { title: "Project" }
  const project = await getProjectById(id, session.user.id)
  if (!project) return { title: "Project" }
  return {
    title: project.name,
    description: project.description || `Connected resources, notes, and progress for ${project.name}`,
  }
}

export default async function ProjectDetailPage({
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
  
  const [project, linkedResources, linkedNotes] = await Promise.all([
    getProjectById(id, userId),
    getResourcesByProjectId(id, userId),
    getNotesByProjectId(id, userId)
  ])

  if (!project) {
    notFound()
  }

  return (
    <ProjectContent 
      project={project} 
      resources={linkedResources} 
      notes={linkedNotes} 
    />
  )
}
