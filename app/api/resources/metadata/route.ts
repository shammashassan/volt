import { NextResponse } from "next/server"
import { fetchUrlMetadata } from "@/lib/services/metadata.service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const urlParam = searchParams.get("url")

  if (!urlParam) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
  }

  const metadata = await fetchUrlMetadata(urlParam)
  return NextResponse.json(metadata)
}
