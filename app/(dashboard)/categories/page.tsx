import { getCategories } from "@/lib/db"
import { CategoriesContent } from "./categories-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Category } from "@/lib/types"


export default async function CategoriesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  const categories = await getCategories(userId)
  
  return <CategoriesContent initialCategories={categories} />
}
