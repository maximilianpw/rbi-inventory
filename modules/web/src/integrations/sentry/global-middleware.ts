import * as Sentry from '@sentry/tanstackstart-react'
import { createMiddleware } from '@tanstack/react-start'

export const sentryMiddleware = createMiddleware().server(
  Sentry.sentryGlobalServerMiddlewareHandler(),
)
