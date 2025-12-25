import path from 'node:path'
import { withSentryConfig } from '@sentry/nextjs'
import withSerwistInit from '@serwist/next'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.resolve(import.meta.dirname, '../../'),
  },
}

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

export default withSerwist(
  withSentryConfig(nextConfig, {
    org: 'rivierabeauty-interiors',
    project: 'inventory',
    silent: process.env.CI !== 'true',
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    webpack: {
      treeshake: {
        removeDebugLogging: true,
      },
      automaticVercelMonitors: true,
    },
  }),
)
