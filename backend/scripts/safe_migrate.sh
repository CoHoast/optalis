#!/bin/bash

# =============================================================================
# SAFE MIGRATION SCRIPT
# =============================================================================
# This script creates a backup before running any database migration.
# 
# Usage:
#   ./scripts/safe_migrate.sh <migration_file.sql>
#
# Example:
#   ./scripts/safe_migrate.sh migrations/006_new_feature.sql
#
# What it does:
#   1. Creates a timestamped backup of the database
#   2. Asks for confirmation before proceeding
#   3. Runs the migration
#   4. Provides rollback instructions if needed
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - reads from environment or uses defaults
DB_HOST="${DB_HOST:-mco-advantage-db.caxy4ekouaq9.us-east-1.rds.amazonaws.com}"
DB_NAME="${DB_NAME:-optalis}"
DB_USER="${DB_USER:-postgres}"
DB_PORT="${DB_PORT:-5432}"

# Backup directory
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# =============================================================================
# FUNCTIONS
# =============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  SAFE MIGRATION SCRIPT${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

create_backup() {
    print_step "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
    
    print_step "Backing up database to: $BACKUP_FILE"
    echo "   This may take a moment..."
    
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -F p \
        -f "$BACKUP_FILE"
    
    # Check backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    print_success "Backup created successfully! Size: $BACKUP_SIZE"
    echo ""
}

run_migration() {
    local migration_file=$1
    
    print_step "Running migration: $migration_file"
    
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -f "$migration_file"
    
    print_success "Migration completed successfully!"
}

print_rollback_instructions() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  ROLLBACK INSTRUCTIONS (if needed)${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "If something went wrong, restore from backup with:"
    echo ""
    echo -e "${YELLOW}  PGPASSWORD=\"\$DB_PASSWORD\" psql -h $DB_HOST -U $DB_USER -d $DB_NAME < $BACKUP_FILE${NC}"
    echo ""
    echo "Or restore to a new database first (safer):"
    echo ""
    echo -e "${YELLOW}  1. Create new DB:  createdb optalis_restored${NC}"
    echo -e "${YELLOW}  2. Restore to it:  psql -d optalis_restored < $BACKUP_FILE${NC}"
    echo -e "${YELLOW}  3. Verify data is correct${NC}"
    echo -e "${YELLOW}  4. Swap databases if needed${NC}"
    echo ""
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

print_header

# Check if migration file was provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/safe_migrate.sh <migration_file.sql>"
    echo ""
    echo "Example:"
    echo "  ./scripts/safe_migrate.sh migrations/006_new_feature.sql"
    echo ""
    exit 1
fi

MIGRATION_FILE=$1

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Check if DB_PASSWORD is set
if [ -z "$DB_PASSWORD" ]; then
    print_error "DB_PASSWORD environment variable is not set!"
    echo ""
    echo "Set it with:"
    echo "  export DB_PASSWORD='your_password_here'"
    echo ""
    exit 1
fi

# Show what we're about to do
echo "📋 Migration Plan:"
echo "   Database: $DB_NAME @ $DB_HOST"
echo "   Migration: $MIGRATION_FILE"
echo "   Backup to: $BACKUP_FILE"
echo ""

# Confirm before proceeding
echo -e "${YELLOW}⚠️  This will modify the database.${NC}"
read -p "Continue? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""

# Step 1: Create backup
create_backup

# Step 2: Confirm one more time before migration
echo -e "${YELLOW}⚠️  Backup complete. Ready to run migration.${NC}"
read -p "Run migration now? (y/N): " confirm_migrate
if [[ ! "$confirm_migrate" =~ ^[Yy]$ ]]; then
    echo "Migration skipped. Backup saved at: $BACKUP_FILE"
    exit 0
fi

# Step 3: Run migration
run_migration "$MIGRATION_FILE"

# Step 4: Print rollback instructions
print_rollback_instructions

# Done
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ MIGRATION COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Backup saved at: $BACKUP_FILE"
echo "Keep this backup for at least 7 days."
echo ""
