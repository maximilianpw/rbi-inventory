import { createRouter as createTanstackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import * as Sentry from '@sentry/tanstackstart-react'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { NotFound } from './components/common/NotFound'

export function getRouter() {
  const rqContext = TanstackQuery.getContext()

  const router = createTanstackRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => <NotFound />,
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <TanstackQuery.Provider {...rqContext}>
          {props.children}
        </TanstackQuery.Provider>
      )
    },
  })

  if (!router.isServer) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [],
    })
  }

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

  return router
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
