import { timestamp, uniqueIndex, varchar, mysqlTable } from 'drizzle-orm/mysql-core'

export const accounts = mysqlTable(
  'accounts',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    firebaseUid: varchar('firebase_uid', { length: 128 }).notNull(),
    email: varchar('email', { length: 320 }),
    displayName: varchar('display_name', { length: 255 }),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [uniqueIndex('accounts_firebase_uid_uq').on(table.firebaseUid)]
)
