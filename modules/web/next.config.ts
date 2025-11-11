import { withSentryConfig } from '@sentry/nextjs'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
}

export default withSentryConfig(nextConfig, {
  org: 'rivierabeauty-interiors',
  project: 'inventory',
  silent: process.env.CI !== 'true',
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  disableLogger: true,
  automaticVercelMonitors: true,
})
