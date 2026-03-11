# Backend Scripts

## Safe Migration Script

**Always use this script when running database migrations!**

### What It Does

1. 📋 **Creates a backup** of the entire database before any changes
2. ✋ **Asks for confirmation** before proceeding
3. 🔄 **Runs the migration**
4. 📝 **Provides rollback instructions** if anything goes wrong

### Usage

```bash
# Navigate to backend folder
cd backend

# Set your database password
export DB_PASSWORD='your_password_here'

# Run a migration safely
./scripts/safe_migrate.sh migrations/006_new_feature.sql
```

### Example Output

```
═══════════════════════════════════════════════════════════════
  SAFE MIGRATION SCRIPT
═══════════════════════════════════════════════════════════════

📋 Migration Plan:
   Database: optalis @ mco-advantage-db...
   Migration: migrations/006_new_feature.sql
   Backup to: ./backups/backup_20260310_173045.sql

⚠️  This will modify the database.
Continue? (y/N): y

▶ Creating backup directory...
▶ Backing up database to: ./backups/backup_20260310_173045.sql
   This may take a moment...
✓ Backup created successfully! Size: 2.4M

⚠️  Backup complete. Ready to run migration.
Run migration now? (y/N): y

▶ Running migration: migrations/006_new_feature.sql
✓ Migration completed successfully!

═══════════════════════════════════════════════════════════════
  ✓ MIGRATION COMPLETE
═══════════════════════════════════════════════════════════════
```

### If Something Goes Wrong

The script will show you exactly how to restore:

```bash
# Restore from backup
PGPASSWORD="$DB_PASSWORD" psql -h <host> -U postgres -d optalis < ./backups/backup_20260310_173045.sql
```

### Backups Location

All backups are stored in: `backend/backups/`

**Keep backups for at least 7 days** after a migration.

### Requirements

- PostgreSQL client tools (`pg_dump`, `psql`)
- `DB_PASSWORD` environment variable set

### Best Practices

1. **Always run on staging first** before production
2. **Review the migration file** before running
3. **Keep backups** for at least 7 days
4. **Test after migration** to verify everything works
