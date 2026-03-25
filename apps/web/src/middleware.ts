import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { canAccessApp, type AppId } from '@0ne/auth/permissions'

// Marketing site paths served on root domains
const MARKETING_PATHS = ['/', '/install', '/diy-install', '/download', '/privacy']

// Domains that serve the marketing site (root domain, not app subdomain)
const MARKETING_DOMAINS = [
  '0neos.com', 'www.0neos.com',
  'project1.ai', 'www.project1.ai',
  'install0ne.com', 'www.install0ne.com',
]

// Domains that redirect to the canonical root domain
const REDIRECT_TO_ROOT_DOMAINS = [
  'project0ne.ai', 'www.project0ne.ai', 'app.project0ne.ai',
  'project0ne.com', 'www.project0ne.com',
  '0necloud.com', 'www.0necloud.com',
  '0nesync.com', 'www.0nesync.com',
]

function handleDomainRouting(request: NextRequest): NextResponse | null {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // app.0neos.com — serve the app, no rewriting needed
  if (hostname === 'app.0neos.com') {
    return null
  }

  // Marketing domains — rewrite to /site/* internally
  if (MARKETING_DOMAINS.includes(hostname)) {
    // API routes pass through (download API, etc.)
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    // Marketing paths get rewritten to /site/*
    if (MARKETING_PATHS.includes(pathname) || pathname.startsWith('/site')) {
      // Don't double-rewrite if already on /site
      if (pathname.startsWith('/site')) {
        return NextResponse.next()
      }
      const url = request.nextUrl.clone()
      url.pathname = `/site${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
    // Non-marketing paths on root domain → redirect to app subdomain
    const url = request.nextUrl.clone()
    url.host = 'app.0neos.com'
    return NextResponse.redirect(url, 307)
  }

  // Other 0ne domains → redirect to 0neos.com
  if (REDIRECT_TO_ROOT_DOMAINS.includes(hostname)) {
    const url = request.nextUrl.clone()
    url.host = '0neos.com'
    return NextResponse.redirect(url, 307)
  }

  return null
}

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/request-access',
  '/embed(.*)',
  '/privacy',
  '/security-policy',
  '/access-control',
  '/site(.*)', // Marketing site pages (no auth)
  '/api/public(.*)',
  '/api/cron(.*)',
  '/api/download(.*)', // Marketing site download API (token auth)
  '/api/external(.*)', // External API uses API key auth
  '/api/extension(.*)', // Chrome extension uses API key auth
  '/api/auth(.*)', // OAuth callbacks
  '/api/webhooks(.*)', // Webhooks from external services
  '/api/widget(.*)', // Widget API uses its own token auth
  '/api/admin/invites/validate', // Invite validation (pre-auth)
])

const appRoutes: Record<string, AppId> = {
  '/kpi': 'kpi',
  '/prospector': 'prospector',
  '/skool-sync': 'skoolSync',
  '/skool': 'skoolScheduler',
  '/media': 'ghlMedia',
}

export default clerkMiddleware(async (auth, request) => {
  // Handle domain routing (marketing site rewrites, redirects)
  const domainResponse = handleDomainRouting(request)
  if (domainResponse) return domainResponse

  const { pathname } = request.nextUrl

  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  const { userId, sessionClaims } = await auth.protect()

  // Onboarding redirect: if user hasn't completed onboarding, send them there
  const skipOnboardingCheck =
    pathname.startsWith('/api/') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/sign-out')

  if (!skipOnboardingCheck) {
    const metadata = sessionClaims?.metadata as { onboardingComplete?: boolean; permissions?: { isAdmin?: boolean } } | undefined
    const isAdmin = metadata?.permissions?.isAdmin === true
    // Admins without onboardingComplete are treated as complete (existing users)
    if (!metadata?.onboardingComplete && !isAdmin) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  for (const [route, appId] of Object.entries(appRoutes)) {
    if (pathname.startsWith(route)) {
      const hasAccess = await canAccessApp(userId, appId)
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
