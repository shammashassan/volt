export interface UrlMetadata {
  title: string
  description: string
  faviconUrl: string
  imageUrl?: string
}

function unescapeHtml(str: string): string {
  if (!str) return ""
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#27;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .trim()
}

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  if (!url || !url.trim()) {
    return {
      title: "Saved Resource",
      description: "",
      faviconUrl: "",
      imageUrl: "",
    }
  }

  // Ensure url has a protocol
  let targetUrl = url.trim()
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`
  }

  let urlObj: URL
  try {
    urlObj = new URL(targetUrl)
  } catch {
    return {
      title: "Saved Resource",
      description: "",
      faviconUrl: "",
      imageUrl: "",
    }
  }

  const defaultFallback: UrlMetadata = {
    title: urlObj.hostname.replace(/^www\./, ""),
    description: "",
    faviconUrl: `${urlObj.origin}/favicon.ico`,
    imageUrl: "",
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return defaultFallback
    }

    const html = await response.text()

    // 1. Title Extraction
    const ogTitleMatch =
      html.match(/<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:title["']/i)
    const twitterTitleMatch =
      html.match(/<meta[^>]+(?:name|property)=["']twitter:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']twitter:title["']/i)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)

    const rawTitle = ogTitleMatch
      ? ogTitleMatch[1]
      : twitterTitleMatch
      ? twitterTitleMatch[1]
      : titleMatch
      ? titleMatch[1]
      : urlObj.hostname.replace(/^www\./, "")

    const title = unescapeHtml(rawTitle) || urlObj.hostname.replace(/^www\./, "")

    // 2. Description Extraction
    const ogDescMatch =
      html.match(/<meta[^>]+(?:property|name)=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:description["']/i)
    const twitterDescMatch =
      html.match(/<meta[^>]+(?:name|property)=["']twitter:description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']twitter:description["']/i)
    const metaDescMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)

    const rawDesc = ogDescMatch
      ? ogDescMatch[1]
      : twitterDescMatch
      ? twitterDescMatch[1]
      : metaDescMatch
      ? metaDescMatch[1]
      : ""

    const description = unescapeHtml(rawDesc)

    // 3. Preview Image (OG/Twitter)
    const ogImageMatch =
      html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i)
    const twitterImageMatch =
      html.match(/<meta[^>]+(?:name|property)=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']twitter:image["']/i)

    const imageUrl = (ogImageMatch ? ogImageMatch[1] : twitterImageMatch ? twitterImageMatch[1] : "").trim()
    let resolvedImageUrl = imageUrl
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      try {
        if (imageUrl.startsWith("/")) {
          resolvedImageUrl = `${urlObj.origin}${imageUrl}`
        } else {
          resolvedImageUrl = `${urlObj.origin}/${imageUrl}`
        }
      } catch {
        resolvedImageUrl = ""
      }
    }

    // 4. Favicon extraction
    const iconRegexes = [
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
      /<link[^>]+rel=["']apple-touch-icon(?:-precomposed)?["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon(?:-precomposed)?["']/i,
    ]

    let foundIcon = ""
    for (const regex of iconRegexes) {
      const match = html.match(regex)
      if (match && match[1]) {
        foundIcon = match[1].trim()
        break
      }
    }

    let faviconUrl = ""
    if (foundIcon) {
      if (foundIcon.startsWith("//")) {
        faviconUrl = `${urlObj.protocol}${foundIcon}`
      } else if (foundIcon.startsWith("/")) {
        faviconUrl = `${urlObj.origin}${foundIcon}`
      } else if (/^https?:\/\//i.test(foundIcon)) {
        faviconUrl = foundIcon
      } else {
        faviconUrl = `${urlObj.origin}/${foundIcon}`
      }
    } else {
      faviconUrl = `${urlObj.origin}/favicon.ico`
    }

    return {
      title,
      description,
      faviconUrl,
      imageUrl: resolvedImageUrl,
    }
  } catch {
    return defaultFallback
  }
}
