import { NextResponse, type NextRequest } from 'next/server'

import { clerkMiddleware } from '@clerk/nextjs/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['en', 'de', 'fr'] as const
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  for (const [key, value] of request.headers.entries()) {
    negotiatorHeaders[key] = value
  }

  try {
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
    return match(languages, locales, defaultLocale)
  } catch {
    return defaultLocale
  }
}

export default clerkMiddleware((_, request: NextRequest) => {
  const { pathname } = request.nextUrl

  // Skip locale handling for specific routes and static files
  const skipLocaleRoutes = ['/monitoring', '/api', '/manifest.json', '/icons', '/sw.js']
  if (skipLocaleRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Redirect if there is no locale
  const locale = getLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
