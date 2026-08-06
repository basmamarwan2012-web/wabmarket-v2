import 'server-only'

export interface RepositoryUnitOfWorkBoundary {
  readonly id: string
  readonly kind: string
}

/** Created only by a trusted server boundary; never from client authorization input. */
export interface RepositoryContext {
  readonly tenantUid: string
  readonly correlationId?: string
  readonly actorUid?: string
  readonly unitOfWork?: RepositoryUnitOfWorkBoundary
}

export interface BoundedReadOptions {
  readonly limit: number
  readonly cursor?: string
}

export interface RepositoryPage<T> {
  readonly items: readonly T[]
  readonly nextCursor: string | null
}
