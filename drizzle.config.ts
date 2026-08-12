import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'mysql',
  schema: './infrastructure/mysql/schema/index.ts',
  out: './infrastructure/mysql/migrations',
  strict: true,
  verbose: true,
  // Migration generation needs no database credentials. Applying migrations is
  // an explicit future deployment operation, not part of application startup.
})
