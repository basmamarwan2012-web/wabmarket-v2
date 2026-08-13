import { z } from 'zod'

const nullableId = z.string().trim().min(1).max(128).nullable().optional()

export const saveAdminMarketplacePreparationSchema = z
  .object({
    askingPrice: z.coerce.number().finite().positive(),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
    manualDescription: z.string().trim().min(1).max(20_000).nullable().optional(),
    externalSalesUrl: z.string().trim().url().max(2_048),
    ctaConfigured: z.boolean(),
    logoAssetId: nullableId,
    faviconAssetId: nullableId,
    openGraphAssetId: nullableId,
    expectedVersion: z.number().int().positive().nullable(),
  })
  .strict()

export const publishAdminMarketplaceSchema = z
  .object({ expectedPublicationVersion: z.number().int().positive().nullable() })
  .strict()

export const unpublishAdminMarketplaceSchema = z
  .object({
    listingId: z.string().trim().min(1).max(128),
    expectedPublicationVersion: z.number().int().positive(),
  })
  .strict()
