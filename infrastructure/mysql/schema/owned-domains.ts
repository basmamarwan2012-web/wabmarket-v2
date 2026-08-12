import {
  boolean,
  index,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

import { accounts } from './accounts'

export const ownedDomains = mysqlTable(
  'owned_domains',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    accountId: varchar('account_id', { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    normalizedHostname: varchar('normalized_hostname', { length: 253 }).notNull(),
    status: mysqlEnum('status', [
      'opportunity',
      'active',
      'sold',
      'expired',
      'archived',
    ])
      .notNull()
      .default('active'),
    ownershipConfirmed: boolean('ownership_confirmed').notNull().default(false),
    ownershipConfirmedAt: timestamp('ownership_confirmed_at', {
      mode: 'date',
      fsp: 3,
    }),
    ownershipConfirmedByFirebaseUid: varchar(
      'ownership_confirmed_by_firebase_uid',
      { length: 128 }
    ),
    ownershipEvidenceReference: varchar('ownership_evidence_reference', {
      length: 2048,
    }),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    uniqueIndex('owned_domains_account_hostname_uq').on(
      table.accountId,
      table.normalizedHostname
    ),
    uniqueIndex('owned_domains_id_account_uq').on(table.id, table.accountId),
    index('owned_domains_account_idx').on(table.accountId),
  ]
)
