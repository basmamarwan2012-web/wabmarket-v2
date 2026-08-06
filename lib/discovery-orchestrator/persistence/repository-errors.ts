import 'server-only'

export type PersistenceErrorCode =
  | 'PERSISTENCE_NOT_IMPLEMENTED'
  | 'PERSISTENCE_NOT_FOUND'
  | 'PERSISTENCE_CONFLICT'
  | 'PERSISTENCE_INVALID_TRANSITION'
  | 'PERSISTENCE_VERSION_UNSUPPORTED'

export class ProviderPersistenceError extends Error {
  constructor(
    public readonly code: PersistenceErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'ProviderPersistenceError'
  }
}
