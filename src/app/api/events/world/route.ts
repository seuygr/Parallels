import { NextRequest, NextResponse } from 'next/server'
import { fetchWorldEvents } from '@/lib/wikidata'

export async function GET(req: NextRequest) {
  const start = parseInt(req.nextUrl.searchParams.get('start') ?? '0')
  const end = parseInt(req.nextUrl.searchParams.get('end') ?? '0')
  if (!start || !end || start > end) {
    return NextResponse.json({ error: 'Invalid start/end year' }, { status: 400 })
  }
  try {
    const events = await fetchWorldEvents(start, end)
    return NextResponse.json(events, {
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[GET /api/events/world]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
