import { NextResponse } from "next/server";
import { requireAuth, AuthError } from '@/lib/auth-helpers'

export async function GET() {
  try {
    await requireAuth()
    return NextResponse.json({
      version: "4.0.3",
      date: "2026-03-07",
      download: "/supdate/download",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    throw error
  }
}
