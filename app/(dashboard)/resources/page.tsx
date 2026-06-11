import { getResources, getCategories, getProjects, getPeople } from "@/lib/db"
import { ResourcesContent } from "./resources-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Resource, Category, Project, Person } from "@/lib/types"


export default async function ResourcesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id

  const [resources, categories, projects, people] = await Promise.all([
    getResources(userId),
    getCategories(userId),
    getProjects(userId),
    getPeople(userId)
  ])
  
  return (
    <ResourcesContent
      initialResources={resources as unknown as Resource[]}
      categories={categories as unknown as Category[]}
      projects={projects as unknown as Project[]}
      people={people as unknown as Person[]}
    />
  )
}
