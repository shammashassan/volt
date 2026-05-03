import { getResources, getCategories } from "@/lib/db"
import { ResourcesContent } from "./resources-content"

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const [resources, categories] = await Promise.all([
    getResources(),
    getCategories()
  ])
  
  return <ResourcesContent initialResources={resources} categories={categories} />
}
