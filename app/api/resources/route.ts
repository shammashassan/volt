import { getResources } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const resources = await getResources()
    return NextResponse.json(resources)
  } catch (error) {
    console.error("API Resources error:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}
