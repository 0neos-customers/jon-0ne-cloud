import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

/**
 * CRON: Sync About Page Daily Analytics (NO-OP)
 *
 * Previously fetched about page visitor and conversion data from Skool API.
 * Now a no-op — this data is collected by the Chrome extension and pushed
 * via /api/extension/about-page-daily.
 *
 * Kept as a route so Vercel doesn't report missing endpoint errors
 * if any old cron config still references it.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    noop: true,
    message:
      'This cron is a no-op. About page analytics are now collected by the Chrome extension and pushed via /api/extension/about-page-daily.',
    migratedAt: '2026-02-17',
  })
}
