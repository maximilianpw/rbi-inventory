import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  i18n: {
    locales: ['en-US', 'fr'],
    defaultLocale: 'en-US',
  },
}

export default withSentryConfig(nextConfig, {
  org: 'rivierabeauty-interiors',
  project: 'inventory',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  disableLogger: true,
  automaticVercelMonitors: true,
})

