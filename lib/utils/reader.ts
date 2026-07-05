export interface CleanedArticle {
  title: string;
  author?: string;
  content: string;
  wordCount: number;
  readingTime: number;
}

export function cleanHtmlArticle(
  html: string,
  fallbackTitle = "Untitled Article",
  originalUrl?: string
): CleanedArticle {
  // 1. Strip scripts, styles, comments, forms, headers, footers, navs, asides, and iframes
  let clean = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
    .replace(/<noscript[^>]*>([\s\S]*?)<\/noscript>/gi, "")
    .replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, "")
    .replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, "")
    .replace(/<footer[^>]*>([\s\S]*?)<\/footer>/gi, "")
    .replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, "")
    .replace(/<aside[^>]*>([\s\S]*?)<\/aside>/gi, "")
    .replace(/<form[^>]*>([\s\S]*?)<\/form>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // 2. Extract title (og:title, <title>)
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || 
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const title = (ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : fallbackTitle)).trim();

  // 3. Extract Author if available
  const authorMatch = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+property=["']article:author["'][^>]+content=["']([^"']+)["']/i);
  const author = authorMatch ? authorMatch[1].trim() : undefined;

  // 4. Try to find main content block: <article>, [role="main"], or fall back to body
  let mainBody = clean;
  const articleMatch = clean.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const mainRoleMatch = clean.match(/<div[^>]+role=["']main["'][^>]*>([\s\S]*?)<\/div>/i);
  
  if (articleMatch) {
    mainBody = articleMatch[1];
  } else if (mainRoleMatch) {
    mainBody = mainRoleMatch[1];
  } else {
    // If no article tag, grab everything inside <body>
    const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      mainBody = bodyMatch[1];
    }
  }

  // 5. Clean layout nodes but preserve semantic content tags:
  // p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote, pre, code, img, strong, em, a
  // Remove all other divs and spans but keep their inner content
  let content = mainBody;
  
  // Strip class/id/style attributes from tags to prevent layout bleeding
  content = content.replace(/<([a-z1-6]+)\s+[^>]*?(class|style|id|onclick|onload)=["'][\s\S]*?["'][^>]*>/gi, "<$1>");
  
  // Replace divs and spans with their clean text contents
  content = content.replace(/<\/?(div|span|section|header|footer|aside|nav)[^>]*>/gi, "\n");

  // Resolve relative URLs if base URL is provided
  if (originalUrl) {
    try {
      const baseUrl = new URL(originalUrl);
      const origin = baseUrl.origin;
      // Resolve links starting with /
      content = content.replace(/href=["']\/([^"']+)["']/gi, `href="${origin}/$1"`);
      content = content.replace(/src=["']\/([^"']+)["']/gi, `src="${origin}/$1"`);
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  // Filter out multiple empty lines and excessive whitespace
  content = content.replace(/\n\s*\n/g, "\n").trim();

  // 6. Word count estimation
  const textContent = content.replace(/<[^>]+>/g, " ");
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute average

  return {
    title,
    author,
    content,
    wordCount,
    readingTime
  };
}
