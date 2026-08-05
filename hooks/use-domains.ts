import { useDomainStore } from '@/store/domain.store'

export const useDomains = () => {
  const { domains, setDomains, addDomain } = useDomainStore()

  return {
    domains,
    setDomains,
    addDomain,
  }
}
