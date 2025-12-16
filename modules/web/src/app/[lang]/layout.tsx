import { Geist, Geist_Mono } from 'next/font/google'

import { ClerkProvider } from '@clerk/nextjs'

import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import AppSidebar from '@/components/common/Header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AuthProvider } from '@/hooks/providers/AuthProvider'
import { I18nProvider } from '@/hooks/providers/I18nProvider'
import { ReactQueryProvider } from '@/hooks/providers/ReactQueryProvider'

import '../globals.css'
import { ThemeProvider } from '@/hooks/providers/ThemeProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Rivierabeauty Inventory',
  description: 'Inventory management system',
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>): Promise<React.JSX.Element> {
  const { lang } = await params

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <AuthProvider>
            <ReactQueryProvider>
              <I18nProvider>
                <ThemeProvider
                  disableTransitionOnChange
                  enableSystem
                  attribute="class"
                  defaultTheme="system"
                >
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex flex-1 flex-col">{children}</main>
                    <Toaster />
                  </SidebarProvider>
                </ThemeProvider>
              </I18nProvider>
            </ReactQueryProvider>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
