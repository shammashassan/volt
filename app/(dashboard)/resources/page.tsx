import { getResources } from "@/lib/queries/resources";
import { getCategories } from "@/lib/queries/categories";
import { getProjects } from "@/lib/queries/projects";
import { getPeople } from "@/lib/queries/people";
import { ResourcesContent } from "@/components/resources/resources-content";
import { requireAuth } from "@/lib/auth-utils";
import { Resource, Category, Project, Person } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resources",
  description: "Browse, filter, and organize your curated digital bookmarks and web resources.",
}

export default async function ResourcesPage() {
  const session = await requireAuth();
  const userId = session.user.id;

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
