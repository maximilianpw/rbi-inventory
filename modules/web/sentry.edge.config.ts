// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://9789042a48bc2c841c5ca6e824423c43@o4510290843664384.ingest.de.sentry.io/4510290847268944',
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
})
