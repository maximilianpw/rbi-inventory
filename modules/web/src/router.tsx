import { createRouter, type AnyRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter(): AnyRouter {
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
