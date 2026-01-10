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
  createRootRoute,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'

import AppSidebar from '@/components/common/Header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AuthProvider } from '@/hooks/providers/AuthProvider'
import { I18nProvider } from '@/hooks/providers/I18nProvider'
import { ReactQueryProvider } from '@/hooks/providers/ReactQueryProvider'
import { ThemeProvider } from '@/hooks/providers/ThemeProvider'

// eslint-disable-next-line import/order
import appCss from './globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'description',
        content: 'Inventory management system for yacht provisioning',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'RBI',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/icons/icon-192x192.png' },
      { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
    ],
    title: 'Rivierabeauty Inventory',
  }),
  component: RootComponent,
  pendingComponent: RoutePending,
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

function RootDocument({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ReactQueryProvider>
            <I18nProvider>
              <ThemeProvider
                disableTransitionOnChange
                enableSystem
                attribute="class"
                defaultTheme="system"
              >
                <SignedIn>
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex flex-1 flex-col">{children}</main>
                    <Toaster />
                  </SidebarProvider>
                </SignedIn>
                <SignedOut>
                  <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                      <h1 className="mb-4 text-2xl font-semibold">
                        Welcome to RBI Inventory
                      </h1>
                      <SignInButton mode="modal">
                        <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2">
                          Sign In
                        </button>
                      </SignInButton>
                    </div>
                  </div>
                </SignedOut>
              </ThemeProvider>
            </I18nProvider>
          </ReactQueryProvider>
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
