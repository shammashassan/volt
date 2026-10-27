import { getCategories } from "@/lib/queries/categories";
import { getCollections } from "@/lib/queries/collections";
import { CategoriesContent } from "@/components/categories/categories-content";
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Category, Collection } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories",
  description: "Organize and curate your resources into custom categories and collections.",
}

export default async function CategoriesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  const [categories, collections] = await Promise.all([
    getCategories(userId),
    getCollections(userId)
  ])
  
  return (
    <CategoriesContent
      initialCategories={categories as unknown as Category[]}
      initialCollections={collections as unknown as Collection[]}
    />
  )
}

