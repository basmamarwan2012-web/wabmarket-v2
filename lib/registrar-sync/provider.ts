import type {
  RegistrarOwnedDomainListContext,
  RegistrarOwnedDomainPage,
} from './types'

export interface RegistrarOwnedDomainProvider {
  readonly identifier: string
  listOwnedDomains(
    context?: Readonly<RegistrarOwnedDomainListContext>
  ): Promise<RegistrarOwnedDomainPage>
}
