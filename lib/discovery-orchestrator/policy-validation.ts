import 'server-only'

import type { ProviderDeclaration, ProviderSettings } from '@/types/provider-policy'

export const isValidPriority = (value: number | null) =>
  value === null || (Number.isInteger(value) && value >= 0)

export const isValidWeight = (value: number | null) =>
  value === null || (Number.isFinite(value) && value >= 0)

export const isValidCurrencyForAmount = (
  amount: number,
  currency: string | null
) => Number.isFinite(amount) && amount >= 0 && (amount === 0 || Boolean(currency))

export function settingsRestrictDeclaration(
  settings: ProviderSettings,
  declaration: ProviderDeclaration
): boolean {
  return (
    settings.providerIdentifier === declaration.identifier &&
    settings.allowedCategories.every((category) =>
      declaration.categories.includes(category)
    ) &&
    settings.allowedSearchModes.every((mode) =>
      declaration.capabilities.supportedSearchModes.includes(mode)
    )
  )
}

export function isValidProviderPolicy(
  settings: ProviderSettings,
  declaration: ProviderDeclaration
): boolean {
  return (
    isValidPriority(settings.priority) &&
    isValidWeight(settings.weight) &&
    Number.isInteger(settings.configurationVersion) &&
    settings.configurationVersion > 0 &&
    Number.isInteger(declaration.schemaVersion) &&
    declaration.schemaVersion > 0 &&
    isValidCurrencyForAmount(
      declaration.defaultRequestCost.amount,
      declaration.defaultRequestCost.currency
    ) &&
    settingsRestrictDeclaration(settings, declaration)
  )
}
