# MySQL Deployment Runbook

This runbook is the controlled operator path for Wabmarket's relational
persistence foundation. Database access is never performed by build,
postinstall, application startup, or module import.

## Configuration contract

Configure these server-only environment variables in the application and in
the shell used for database operations:

- `DATABASE_HOST`
- `DATABASE_PORT` (defaults to `3306`)
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_SSL` (`disabled` or `required`)
- `DATABASE_CONNECTION_LIMIT` (defaults to `5`, maximum `50`)

Do not expose these values to browser bundles, logs, command output, or source
control. The runtime pool uses a fixed ten-second connection timeout and is
created only after an explicit composition or operator boundary requests it.

## Privilege separation

Use distinct credentials where the hosting environment permits it:

- Runtime credentials need only the data privileges required by application
  repositories (`SELECT`, `INSERT`, `UPDATE`, and `DELETE` on Wabmarket tables).
- Migration credentials additionally need schema privileges required by the
  reviewed migration (`CREATE`, `ALTER`, `INDEX`, and `REFERENCES`, plus access
  to Drizzle's migration-history table).

Do not grant runtime credentials broad account-administration or global server
privileges. If cPanel supplies one user for both roles, reduce its privileges
after migration and before enabling application traffic.

## Controlled deployment sequence

Stop on the first failure. Never continue to migration execution or smoke
testing after an unexplained status or error.

1. Create the MySQL database in cPanel or the approved MySQL administration
   boundary.
2. Create a dedicated database user.
3. Assign only the required runtime or migration privileges described above.
4. Configure the complete `DATABASE_*` environment contract in the Node
   runtime and operator shell without printing the values.
5. Restart the Node application if its hosting environment requires a restart
   to receive changed environment variables.
6. Confirm connectivity with exactly one read-only query:

   ```powershell
   npm.cmd run db:check -- --confirm-live-database-check
   ```

7. Read Drizzle migration status without changing schema:

   ```powershell
   npm.cmd run db:migrate -- --confirm-live-database-migration-status
   ```

8. Inspect the reported `PENDING`, `APPLIED`, or `DRIFTED` state before any
   mutation. `DRIFTED` requires investigation. Business-table existence is not
   migration history and is never accepted as proof that a migration ran.
9. Only after reviewing the migration SQL and status, execute pending Drizzle
   migrations explicitly:

   ```powershell
   npm.cmd run db:migrate -- --confirm-database-migration
   ```

10. Run the transactional synthetic smoke test:

    ```powershell
    npm.cmd run db:smoke -- --confirm-live-database-smoke-test
    ```

11. Verify the smoke report confirms read-back, tenant isolation, and rollback.
    The smoke test uses unique reserved `.example` records, creates no published
    listing, and intentionally rolls its transaction back even on success.
12. Stop on any failure. Preserve the sanitized error code for investigation;
    do not paste credentials or raw database diagnostics into tickets or logs.

## Migration history and immutability

Migration `0001_marketplace_foundation.sql` may be finalized now because it has
not been applied to any real environment. The first successful application to
any real environment permanently freezes migration 0001. Never edit, reorder,
or regenerate an applied migration. Every later schema change must be expressed
as a new reviewed, numbered migration with its own Drizzle journal entry.

Status uses Drizzle's migration-history records and local migration hashes:

- `PENDING`: the database has no history or has a valid local-history prefix.
- `APPLIED`: every local migration has a matching ordered history record.
- `DRIFTED`: history contains an unknown entry, hash mismatch, gap, or entry
  beyond the local journal.

Status mode is read-only. Execution mode refuses `DRIFTED` history, performs no
automatic retries, and never runs from build, start, postinstall, or deployment
hooks.
