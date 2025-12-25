import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/rbi',
    name: 'Rivierabeauty Inventory',
    short_name: 'RBI',
    description: 'Inventory management system for yacht provisioning',
    start_url: '/',
    scope: '/',
    lang: 'en',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0d9488',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
