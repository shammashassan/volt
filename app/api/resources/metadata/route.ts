import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const urlParam = searchParams.get("url")

  if (!urlParam) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
  }

  // Ensure url has a protocol
  let targetUrl = urlParam.trim()
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`
  }

  try {
    // Parse URL to extract hostname
    const urlObj = new URL(targetUrl)
    
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 }, // Cache responses for 1 hour
    })

    if (!response.ok) {
      return NextResponse.json({
        title: urlObj.hostname.replace("www.", ""),
        description: "No preview description available",
        faviconUrl: `https://www.google.com/s2/favicons?sz=64&domain=${urlObj.hostname}`,
      })
    }

    const html = await response.text()

    // 1. Regex parse for Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || 
                          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
    const title = ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : "")

    // 2. Regex parse for Description
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) || 
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || 
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
    const description = ogDescMatch ? ogDescMatch[1] : (descMatch ? descMatch[1] : "")

    // 3. Regex parse for Preview Image (OG/Twitter)
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || 
                          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    const twitterImageMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) || 
                              html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    const imageUrl = (ogImageMatch ? ogImageMatch[1] : (twitterImageMatch ? twitterImageMatch[1] : "")).trim()

    let resolvedImageUrl = imageUrl
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      try {
        if (imageUrl.startsWith("/")) {
          resolvedImageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`
        } else {
          resolvedImageUrl = `${urlObj.protocol}//${urlObj.host}/${imageUrl}`
        }
      } catch {
        // ignore resolving error
      }
    }

    // 4. Reliable Favicon service
    const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${urlObj.hostname}`

    return NextResponse.json({
      title: title.trim() || urlObj.hostname.replace("www.", ""),
      description: description.trim() || "No description available",
      faviconUrl,
      imageUrl: resolvedImageUrl,
    })
  } catch (error) {
    // Fallback if fetch completely fails (e.g. invalid domain name)
    try {
      const urlObj = new URL(targetUrl)
      return NextResponse.json({
        title: urlObj.hostname.replace("www.", ""),
        description: "No preview description available",
        faviconUrl: `https://www.google.com/s2/favicons?sz=64&domain=${urlObj.hostname}`,
        imageUrl: "",
      })
    } catch {
      return NextResponse.json({
        title: "Saved Resource",
        description: "No preview description available",
        faviconUrl: "",
        imageUrl: "",
      })
    }
  }
}
