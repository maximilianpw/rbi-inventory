import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/common/Header'
import { ReactQueryProvider } from '@/hooks/providers/ReactQueryProvider'
import { I18nProvider } from '@/hooks/providers/I18nProvider'
import { AuthProvider } from '@/hooks/providers/AuthProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
}>) {
  const { lang } = await params

  return (
    <ClerkProvider>
      <AuthProvider>
        <ReactQueryProvider>
          <I18nProvider>
            <html lang={lang}>
              <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
              >
                <SidebarProvider>
                  <div suppressHydrationWarning>
                    <AppSidebar />
                  </div>
                  <SidebarInset>
                    <main className="flex flex-1 flex-col p-4">{children}</main>
                  </SidebarInset>
                </SidebarProvider>
              </body>
            </html>
          </I18nProvider>
        </ReactQueryProvider>
      </AuthProvider>
    </ClerkProvider>
  )
}
