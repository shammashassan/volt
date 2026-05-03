import { getCategories, getResources } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [categories, resources] = await Promise.all([
      getCategories(),
      getResources()
    ])

    const categoriesWithCounts = categories.map(cat => ({
      ...cat,
      resourceCount: resources.filter(res => res.category === cat.id).length
    }))

    return NextResponse.json(categoriesWithCounts)
  } catch (error) {
    console.error("API Categories error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
