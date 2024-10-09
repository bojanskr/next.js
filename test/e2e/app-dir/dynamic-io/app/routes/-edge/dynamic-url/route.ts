import type { NextRequest } from 'next/server'

import { getSentinelValue } from '../../../getSentinelValue'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search
  return new Response(
    JSON.stringify({
      value: getSentinelValue(),
      search,
    })
  )
}