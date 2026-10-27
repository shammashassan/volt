import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/sign-in',
          '/sign-up',
          '/account',
          '/categories',
          '/commands',
          '/explore',
          '/graph',
          '/media-watchlist',
          '/resources',
          '/projects',
          '/notes',
          '/people',
          '/tags',
          '/users',
          '/reminders',
          '/notifications',
          '/share',
          '/quick-save',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
