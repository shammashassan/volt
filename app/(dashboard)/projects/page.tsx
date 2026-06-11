import { getProjects } from "@/lib/db"
import { ProjectsContent } from "./projects-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"


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
