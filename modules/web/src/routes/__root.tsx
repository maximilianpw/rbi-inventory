import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
} from '@clerk/tanstack-react-start'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  Link,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'

import AppSidebar from '@/components/common/Header'
import { ErrorState } from '@/components/common/ErrorState'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AuthProvider } from '@/hooks/providers/AuthProvider'
import { BrandingProvider, useBranding } from '@/hooks/providers/BrandingProvider'
import { I18nProvider } from '@/hooks/providers/I18nProvider'
import { ThemeProvider } from '@/hooks/providers/ThemeProvider'
import { Theme } from '@/lib/enums/theme.enum'
import type { RouterContext } from '@/lib/router/context'

// eslint-disable-next-line import/order
import appCss from './globals.css?url'

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
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
  pendingComponent: RoutePending,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
})

function RootComponent(): React.JSX.Element {
  return (
    <ClerkProvider>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ClerkProvider>
  )
}

function DynamicHead(): React.JSX.Element {
  const { branding } = useBranding()

  return (
    <>
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
    </>
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
        <SignInButton mode="modal">
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  )
}

function RootDocument({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <AuthProvider>
          <BrandingProvider>
            <DynamicHead />
            <I18nProvider>
              <ThemeProvider
                disableTransitionOnChange
                enableSystem
                attribute="class"
                defaultTheme={Theme.SYSTEM}
              >
                <SignedIn>
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex flex-1 flex-col">{children}</main>
                    <Toaster />
                  </SidebarProvider>
                </SignedIn>
                <SignedOut>
                  <WelcomeScreen />
                </SignedOut>
              </ThemeProvider>
            </I18nProvider>
          </BrandingProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  )
}

function RoutePending(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 h-1 w-full bg-primary/20"
    >
      <div className="h-full w-1/3 animate-pulse bg-primary" />
    </div>
  )
}

function RouteError({ error }: ErrorComponentProps): React.JSX.Element {
  const message =
    error instanceof Error && error.message ? error.message : 'Something went wrong.'
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4">
        <ErrorState
          message={message}
          variant="bordered"
        />
        <div className="flex justify-center">
          <Link className="text-primary underline" to="/">
            Return home
          </Link>
        </div>
      </div>
    </div>
  )
}

function RouteNotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
        <Link className="text-primary underline" to="/">
          Return home
        </Link>
      </div>
    </div>
  )
}
