import type { PersistenceIdentityContext } from '@/lib/persistence/context'

export interface AccountRecord {
  readonly id: string
  readonly firebaseUid: string
  readonly email: string | null
  readonly displayName: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface AccountProvisioningInput {
  readonly displayName?: string | null
}

export interface AccountRepository {
  findByFirebaseIdentity(
    identity: PersistenceIdentityContext
  ): Promise<AccountRecord | null>
  resolveOrProvision(
    identity: PersistenceIdentityContext,
    input?: AccountProvisioningInput
  ): Promise<AccountRecord>
}
