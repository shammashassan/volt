import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Volt',
    short_name: 'Volt',
    description: 'Volt v2.0 - The personal knowledge operating system. Save, organize, and link resources, notes, categories, people, and media watchlists.',
    id: '/',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Open the Volt dashboard',
        url: '/dashboard',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Quick Save',
        short_name: 'Quick Save',
        description: 'Quickly save a resource to Volt',
        url: '/quick-save',
        icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192' }],
      },
    ],
    share_target: {
      action: '/share',
      method: 'GET',
      enctype: 'application/x-www-form-urlencoded',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      },
    },
  }
}
