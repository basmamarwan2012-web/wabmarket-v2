import {
  boolean,
  datetime,
  foreignKey,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

import { accounts } from './accounts'
import { ownedDomains } from './owned-domains'

export const ownedDomainRegistrarAssociations = mysqlTable(
  'owned_domain_registrar_associations',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    accountId: varchar('account_id', { length: 36 })
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    ownedDomainId: varchar('owned_domain_id', { length: 36 }).notNull(),
    providerIdentifier: varchar('provider_identifier', { length: 64 }).notNull(),
    providerDomainIdentifier: varchar('provider_domain_identifier', {
      length: 255,
    }),
    registrarStatus: mysqlEnum('registrar_status', [
      'ACTIVE',
      'INACTIVE',
      'EXPIRED',
      'TRANSFER_AWAY',
      'UNKNOWN',
    ])
      .notNull()
      .default('UNKNOWN'),
    expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }),
    autoRenew: boolean('auto_renew'),
    firstSeenAt: timestamp('first_seen_at', { mode: 'date', fsp: 3 }).notNull(),
    lastSeenAt: timestamp('last_seen_at', { mode: 'date', fsp: 3 }).notNull(),
    lastSyncedAt: timestamp('last_synced_at', { mode: 'date', fsp: 3 }).notNull(),
    syncState: mysqlEnum('sync_state', ['SEEN', 'MISSING'])
      .notNull()
      .default('SEEN'),
    provenanceReference: varchar('provenance_reference', {
      length: 255,
    }).notNull(),
    version: int('version', { unsigned: true }).notNull().default(1),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    uniqueIndex('registrar_assoc_domain_provider_uq').on(
      table.ownedDomainId,
      table.providerIdentifier
    ),
    foreignKey({
      name: 'registrar_assoc_owned_domain_account_fk',
      columns: [table.ownedDomainId, table.accountId],
      foreignColumns: [ownedDomains.id, ownedDomains.accountId],
    }).onDelete('cascade'),
    index('registrar_assoc_account_provider_state_idx').on(
      table.accountId,
      table.providerIdentifier,
      table.syncState
    ),
    index('registrar_assoc_account_domain_idx').on(
      table.accountId,
      table.ownedDomainId
    ),
  ]
)
