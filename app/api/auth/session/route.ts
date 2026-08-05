import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createSessionCookie } from '@/lib/auth/session'

const sessionSchema = z.object({ idToken: z.string().min(1) })

export async function POST(request: Request) {
  const parsed = sessionSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'A valid ID token is required.' },
      { status: 400 }
    )
  }

  try {
    await createSessionCookie(parsed.data.idToken)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error:
          'This account is not authorized. A project owner must assign a role.',
      },
      { status: 401 }
    )
  }
}
