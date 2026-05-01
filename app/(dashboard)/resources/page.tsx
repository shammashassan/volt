import { getResources } from "@/lib/db"
import { ResourcesContent } from "./resources-content"

export default async function ResourcesPage() {
  const resources = await getResources()
  
  return <ResourcesContent initialResources={resources} />
}
