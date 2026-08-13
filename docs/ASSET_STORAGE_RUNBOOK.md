# Asset storage deployment runbook

Wabmarket stores asset metadata in MySQL and asset bytes in a private filesystem directory. The two locations must be backed up and restored as one logical dataset.

1. Create a private writable directory with cPanel File Manager or Terminal.
2. Keep it outside the application source tree and preferably outside the public webroot.
3. Ensure the Node.js application user has read and write permissions.
4. Set `ASSET_STORAGE_ROOT` to the directory's absolute server path.
5. Restart the Node.js application after changing the environment.
6. Do not put credentials or configuration files in the asset directory.
7. Back up the directory together with the matching MySQL metadata.

The application never assumes a cPanel username, account path, `public_html`, or hosting vendor. Public reads pass through `/media/domain-assets/<asset-id>` and require an active reference in a published marketplace snapshot; the storage directory itself remains private.

Filesystem writes and MySQL writes cannot share an ACID transaction. Upload failures compensate by deleting a newly written file. Delete failures restore the saved bytes when metadata removal fails. A compensation failure is surfaced explicitly so operators can investigate orphan risk.
