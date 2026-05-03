import { getCategories } from "@/lib/db"
import { CategoriesContent } from "./categories-content"

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories()
  
  return <CategoriesContent initialCategories={categories} />
}
