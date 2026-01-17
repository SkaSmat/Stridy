# Database Migrations

## Overview

This folder contains SQL migration files for the Stridy database. Migrations should be run in sequential order.

## Migration Files (Clean Set)

### ✅ Core Schema Migrations

**001_create_base_schema.sql**
- Creates all base tables (user_profiles, gps_tracks, explored_streets, city_progress, user_badges)
- Creates core PostgreSQL functions (calculate_explored_streets_v2, update_user_stats_from_track, etc.)
- Enables PostGIS extension
- Creates indexes for performance
- **Status**: For fresh installations only (tables may already exist)

**002_alter_existing_schema.sql**
- Safely adds missing columns to existing tables
- Uses `IF NOT EXISTS` for all operations
- Safe to run multiple times (idempotent)
- **Status**: Alternative to 001 for existing databases

**003_fix_functions_and_schema.sql** ✅ **RECOMMENDED**
- Drops and recreates all functions with correct signatures
- Adds any missing columns
- Safe to run on existing databases
- **Status**: This is the migration that worked successfully!

### ✅ Feature Migrations

**004_add_strava_integration.sql**
- Creates `strava_connections` table
- Adds `strava_activity_id` and `source` columns to `gps_tracks`
- Enables Strava OAuth integration
- **Run after**: 003

**005_enable_rls_policies.sql** 🔒
- Enables Row Level Security (RLS) on all tables
- Creates security policies for data access
- Protects user data from unauthorized access
- **Run after**: All other migrations
- **IMPORTANT**: Only run in production when ready!

## Execution Order

### For Fresh Database
```sql
-- 1. Run base schema
\i 001_create_base_schema.sql

-- 2. Add Strava integration
\i 004_add_strava_integration.sql

-- 3. Enable security (production only)
\i 005_enable_rls_policies.sql
```

### For Existing Database (RECOMMENDED)
```sql
-- 1. Fix functions and add missing columns
\i 003_fix_functions_and_schema.sql

-- 2. Add Strava integration (if not done)
\i 004_add_strava_integration.sql

-- 3. Enable security (production only)
\i 005_enable_rls_policies.sql
```

## Verification

After running migrations, verify with:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check functions exist
SELECT proname FROM pg_proc
WHERE proname IN (
  'calculate_explored_streets_v2',
  'update_user_stats_from_track',
  'update_streak',
  'get_user_stats',
  'get_city_leaderboard'
);

-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## Removed Migrations (Archived)

The following migrations were removed as duplicates or conflicts:

- ❌ `add_strava_integration.sql` - Duplicate of 004 (less complete)
- ❌ `disable-rls-mvp.sql` - Moved to scripts/ (dev-only)
- ❌ `enable-rls-production.sql` - Duplicate of 005 (less complete)
- ❌ `000_verify_schema.sql` - Moved to scripts/ (diagnostic tool)
- ❌ `DIAGNOSTIC_COMPLET.sql` - Moved to scripts/ (diagnostic tool)

## Scripts Folder

Non-migration SQL files are in `/supabase/scripts/`:

- `000_verify_schema.sql` - Check current database state
- `DIAGNOSTIC_COMPLET.sql` - Comprehensive database diagnostic
- `disable-rls-mvp.sql` - Disable RLS for development (use carefully)

## Troubleshooting

### Function already exists error
```
ERROR: function already exists with different signature
```
**Solution**: Use 003_fix_functions_and_schema.sql which drops before recreating

### Column already exists error
```
ERROR: column "osm_id" already exists
```
**Solution**: Migrations 002 and 003 handle this with `IF NOT EXISTS`

### Constraint violation error
```
ERROR: duplicate key value violates unique constraint
```
**Solution**: Check data for duplicates before adding unique constraints

### RLS blocking queries
```
ERROR: permission denied for table user_profiles
```
**Solution**:
- Check RLS policies are correct
- Verify user is authenticated
- For development, temporarily disable RLS with scripts/disable-rls-mvp.sql

## Production Deployment Checklist

Before deploying to production:

- [ ] Backup database
- [ ] Test migrations on staging database first
- [ ] Run migrations in order (001 or 003 → 004 → 005)
- [ ] Verify all functions exist
- [ ] Test GPS tracking saves data
- [ ] Enable RLS (005) last
- [ ] Test app with RLS enabled
- [ ] Verify users can only access own data

## Notes

- All migrations use PostgreSQL/PostGIS
- Migrations are designed to be idempotent where possible
- Always backup before running migrations in production
- RLS should be enabled in production for security
