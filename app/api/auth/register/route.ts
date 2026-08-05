import { FieldValue } from 'firebase-admin/firestore'
import { NextResponse } from 'next/server'

import { adminAuth, adminDb } from '@/firebase/admin'
import { DEFAULT_USER_ROLE } from '@/lib/auth/roles'
import { registerSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid registration details.' },
      { status: 400 }
    )
  }

  let createdUserId: string | null = null

  try {
    const user = await adminAuth.createUser({
      displayName: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      emailVerified: false,
      disabled: false,
    })
    createdUserId = user.uid

    await adminAuth.setCustomUserClaims(user.uid, { role: DEFAULT_USER_ROLE })
    await adminDb.collection('users').doc(user.uid).set({
      id: user.uid,
      name: parsed.data.name,
      email: parsed.data.email,
      role: DEFAULT_USER_ROLE,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json(
      { success: true, message: 'Account created. Please sign in.' },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (createdUserId) {
      await adminAuth.deleteUser(createdUserId).catch(() => undefined)
    }

    const isDuplicateEmail =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'auth/email-already-exists'

    return NextResponse.json(
      {
        success: false,
        error: isDuplicateEmail
          ? 'An account already exists for this email address.'
          : 'Account creation failed.',
      },
      { status: isDuplicateEmail ? 409 : 500 }
    )
  }
}
