import {
  bigint,
  foreignKey,
  index,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

import { accounts } from './accounts'
import { ownedDomains } from './owned-domains'

export const domainAssets = mysqlTable(
  'domain_assets',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    accountId: varchar('account_id', { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    ownedDomainId: varchar('owned_domain_id', { length: 36 }).notNull(),
    kind: mysqlEnum('kind', ['LOGO', 'FAVICON', 'OPEN_GRAPH_IMAGE']).notNull(),
    storageKey: varchar('storage_key', { length: 1024 }).notNull(),
    publicReference: varchar('public_reference', { length: 2048 }),
    mimeType: varchar('mime_type', { length: 255 }).notNull(),
    byteSize: bigint('byte_size', { mode: 'number', unsigned: true }).notNull(),
    checksum: varchar('checksum', { length: 128 }).notNull(),
    status: mysqlEnum('status', ['PENDING', 'AVAILABLE'])
      .notNull()
      .default('PENDING'),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    uniqueIndex('domain_assets_storage_key_uq').on(table.storageKey),
    foreignKey({
      name: 'domain_assets_owned_domain_account_fk',
      columns: [table.ownedDomainId, table.accountId],
      foreignColumns: [ownedDomains.id, ownedDomains.accountId],
    }).onDelete('cascade'),
    index('domain_assets_account_domain_idx').on(
      table.accountId,
      table.ownedDomainId
    ),
  ]
)
