import { registerHooks } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { FieldValue } from 'firebase-admin/firestore'

const serverOnlyShimUrl = pathToFileURL(
  resolve('node_modules/next/dist/compiled/server-only/empty.js')
).href

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') {
      return { shortCircuit: true, url: serverOnlyShimUrl }
    }

    return nextResolve(specifier, context)
  },
})

const uid = process.argv[2]

if (!uid || process.argv.length !== 3) {
  console.error(
    'Usage: node --env-file=.env.local scripts/bootstrap-administrator.mjs <firebase-uid>'
  )
  process.exitCode = 1
} else {
  const { adminAuth, adminDb } = await import('../firebase/admin.ts')
  const user = await adminAuth.getUser(uid)

  await adminAuth.setCustomUserClaims(uid, {
    ...user.customClaims,
    role: 'administrator',
  })

  await adminDb.collection('users').doc(uid).set(
    {
      role: 'administrator',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

  console.log(`Administrator role assigned to Firebase UID ${uid}.`)
  console.log('Sign out and sign in again to refresh the custom claims.')
}
