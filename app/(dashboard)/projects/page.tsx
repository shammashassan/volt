import { getProjects } from "@/lib/queries/projects";
import { ProjectsContent } from "@/components/projects/projects-content";
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects",
  description: "Track your active initiatives, linked resources, and project milestones.",
}

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  const projects = await getProjects(userId)
  
  return <ProjectsContent initialProjects={projects} />
}
