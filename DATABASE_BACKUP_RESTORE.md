# Database backup and restore

The production PostgreSQL database is backed up daily by GitHub Actions. Backups are custom-format `pg_dump` files encrypted with AES-256 before they are uploaded as private workflow artifacts. Artifacts are retained for 30 days.

## Required GitHub secrets

Configure these under **Repository → Settings → Secrets and variables → Actions**:

- `NEON_DATABASE_URL`: the direct (non-pooler) production Neon connection string.
- `DB_BACKUP_PASSPHRASE`: a unique random passphrase of at least 24 characters. Keep a second copy in a password manager outside GitHub. Losing it makes all encrypted backups unusable.
- `NEON_RESTORE_TEST_DATABASE_URL`: only needed for restore tests. This must point to a separate disposable Neon branch/database and must never equal the production URL.

## Create the first backup

1. Open the repository's **Actions** tab.
2. Select **Database backup**.
3. Choose **Run workflow → Run workflow**.
4. Wait for the run to finish successfully.
5. Open the completed run and download its `database-backup-...` artifact.
6. Store the downloaded file securely. It is encrypted, but it still contains production data.

The workflow also runs every day at 01:15 UTC. GitHub may start scheduled workflows a little later during busy periods.

## Test restoration safely

Never test a restore against production.

1. In Neon, create a separate temporary branch or database.
2. Add its **direct** connection string as `NEON_RESTORE_TEST_DATABASE_URL` in GitHub Secrets.
3. Find the numeric run ID in the URL of a successful backup run: `.../actions/runs/RUN_ID`.
4. Open **Actions → Database restore test → Run workflow**.
5. Enter the backup run ID.
6. Enter `RESTORE-TO-TEST` as confirmation.
7. Run the workflow and verify that it reports a nonzero public-table count.
8. Inspect several important tables in the temporary Neon branch, then delete the temporary branch when finished.

The restore workflow compares the production and test connection strings and refuses to continue if they are identical. It intentionally replaces all contents of the configured test database.

## Recovery notes

- Download at least one successful backup periodically so recovery does not depend solely on GitHub artifact retention.
- Create an extra manual backup before schema migrations or major releases.
- Perform a restore test before launch and at least every three months afterward.
- Neon snapshots are useful for fast rollback, but this external encrypted dump is the independent recovery copy.
