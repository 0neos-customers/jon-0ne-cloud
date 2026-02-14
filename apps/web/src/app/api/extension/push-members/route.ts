import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@0ne/db/server'

export const dynamic = 'force-dynamic'

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * OPTIONS /api/extension/push-members
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

/**
 * Chrome Extension Push Members API
 *
 * Receives member data from the Skool Chrome extension
 * and stores them in the skool_members table.
 */

// =============================================
// Types
// =============================================

interface IncomingMember {
  skoolUserId: string
  name?: string
  email?: string
  avatarUrl?: string
  level?: number
  points?: number
  joinedAt?: string | null
  lastSeenAt?: string | null
}

interface PushMembersRequest {
  staffSkoolId: string
  groupId: string
  members: IncomingMember[]
}

interface PushMembersResponse {
  success: boolean
  upserted: number
  errors?: string[]
}

// =============================================
// Auth Helper
// =============================================

function validateExtensionApiKey(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization')
  const expectedKey = process.env.EXTENSION_API_KEY

  if (!expectedKey) {
    console.error('[Extension API] EXTENSION_API_KEY environment variable not set')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500, headers: corsHeaders }
    )
  }

  if (!authHeader) {
    return NextResponse.json(
      { error: 'Missing Authorization header' },
      { status: 401, headers: corsHeaders }
    )
  }

  // Extract Bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return NextResponse.json(
      { error: 'Invalid Authorization header format. Expected: Bearer {apiKey}' },
      { status: 401, headers: corsHeaders }
    )
  }

  const apiKey = match[1]
  if (apiKey !== expectedKey) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401, headers: corsHeaders }
    )
  }

  return null // Valid
}

// =============================================
// POST /api/extension/push-members
// =============================================

export async function POST(request: NextRequest) {
  // Validate API key
  const authError = validateExtensionApiKey(request)
  if (authError) return authError

  try {
    const body: PushMembersRequest = await request.json()

    // Validate request structure
    const validationError = validateRequest(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400, headers: corsHeaders })
    }

    const { staffSkoolId, groupId, members } = body

    console.log(
      `[Extension API] Received ${members.length} members for group ${groupId}`
    )

    const supabase = createServerClient()
    let upserted = 0
    const errors: string[] = []

    // Upsert members in batches
    for (const member of members) {
      try {
        const memberRow = {
          user_id: staffSkoolId,
          group_id: groupId,
          skool_user_id: member.skoolUserId,
          name: member.name || null,
          email: member.email || null,
          avatar_url: member.avatarUrl || null,
          level: member.level ?? null,
          points: member.points ?? null,
          joined_at: member.joinedAt || null,
          last_seen_at: member.lastSeenAt || null,
          synced_at: new Date().toISOString(),
        }

        const { error } = await supabase
          .from('skool_members')
          .upsert(memberRow, {
            onConflict: 'user_id,group_id,skool_user_id',
          })

        if (error) {
          console.error(`[Extension API] Error upserting member ${member.skoolUserId}:`, error)
          errors.push(`Member ${member.skoolUserId}: ${error.message}`)
        } else {
          upserted++
        }
      } catch (memberError) {
        console.error(`[Extension API] Exception processing member ${member.skoolUserId}:`, memberError)
        errors.push(
          `Member ${member.skoolUserId}: ${memberError instanceof Error ? memberError.message : 'Unknown error'}`
        )
      }
    }

    console.log(
      `[Extension API] Members complete: upserted=${upserted}, errors=${errors.length}`
    )

    const response: PushMembersResponse = {
      success: errors.length === 0,
      upserted,
      ...(errors.length > 0 && { errors }),
    }

    return NextResponse.json(response, { headers: corsHeaders })
  } catch (error) {
    console.error('[Extension API] POST exception:', error)
    return NextResponse.json(
      {
        success: false,
        upserted: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      } as PushMembersResponse,
      { status: 500, headers: corsHeaders }
    )
  }
}

// =============================================
// Validation
// =============================================

function validateRequest(body: PushMembersRequest): string | null {
  if (!body.staffSkoolId?.trim()) {
    return 'Missing required field: staffSkoolId'
  }

  if (!body.groupId?.trim()) {
    return 'Missing required field: groupId'
  }

  if (!Array.isArray(body.members)) {
    return 'members must be an array'
  }

  if (body.members.length === 0) {
    return 'members array cannot be empty'
  }

  // Validate each member
  for (let i = 0; i < body.members.length; i++) {
    const member = body.members[i]
    if (!member.skoolUserId?.trim()) {
      return `Member at index ${i}: missing required field "skoolUserId"`
    }
  }

  return null
}
