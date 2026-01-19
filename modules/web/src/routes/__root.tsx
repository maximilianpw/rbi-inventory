import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  Link,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'

import AppSidebar from '@/components/common/Header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AuthProvider, useAuthSession } from '@/hooks/providers/AuthProvider'
import {
  BrandingProvider,
  useBranding,
} from '@/hooks/providers/BrandingProvider'
import { I18nProvider } from '@/hooks/providers/I18nProvider'
import { ThemeProvider } from '@/hooks/providers/ThemeProvider'
import { Theme } from '@/lib/enums/theme.enum'
import type { RouterContext } from '@/lib/router/context'

// eslint-disable-next-line import/order
import appCss from './globals.css?url'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import { NotFound } from '@/components/NotFound'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  pendingComponent: RoutePending,
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => NotFound,
})

function RootComponent(): React.JSX.Element {
  return (
    <AuthProvider>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </AuthProvider>
  )
}

function DynamicHead(): React.JSX.Element {
  const { branding } = useBranding()

  return (
    <div>
      <title>{branding.app_name}</title>
      <meta content={branding.tagline} name="description" />
      <meta content={branding.app_name} name="apple-mobile-web-app-title" />
      <link
        href={branding.favicon_url ?? '/icons/icon-192x192.png'}
        rel="icon"
      />
      <link
        href={branding.favicon_url ?? '/icons/apple-touch-icon.png'}
        rel="apple-touch-icon"
      />
    </div>
  )
}

function WelcomeScreen(): React.JSX.Element {
  const { branding } = useBranding()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-semibold">
          Welcome to {branding.app_name}
        </h1>
        <Link
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex rounded-md px-4 py-2"
          to="/login"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}

function AuthLoadingScreen(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground text-sm">Loading…</div>
    </div>
  )
}

function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">{children}</main>
      <Toaster />
    </SidebarProvider>
  )
}

function RootDocument({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { session, isLoading } = useAuthSession()

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <BrandingProvider>
          <DynamicHead />
          <I18nProvider>
            <ThemeProvider
              disableTransitionOnChange
              enableSystem
              attribute="class"
              defaultTheme={Theme.SYSTEM}
            >
              {isLoading ? (
                <AuthLoadingScreen />
              ) : session ? (
                <AuthenticatedLayout>{children}</AuthenticatedLayout>
              ) : (
                <WelcomeScreen />
              )}
            </ThemeProvider>
          </I18nProvider>
        </BrandingProvider>
        <Scripts />
      </body>
    </html>
  )
}

function RoutePending(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="bg-primary/20 pointer-events-none fixed top-0 left-0 z-50 h-1 w-full"
    >
      <div className="bg-primary h-full w-1/3 animate-pulse" />
    </div>
  )
}
