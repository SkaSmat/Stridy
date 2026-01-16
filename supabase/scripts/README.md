# Database Scripts

## Overview

This folder contains SQL scripts for diagnostics, testing, and development. These are **NOT** migrations and should not be run automatically.

## Available Scripts

### 🔍 Diagnostic Scripts

**DIAGNOSTIC_COMPLET.sql**
- Comprehensive database state analysis
- Checks all tables, columns, functions, triggers, RLS policies
- Safe to run anytime (read-only queries)
- **Use case**: Before creating migrations, after deployment, troubleshooting

**000_verify_schema.sql**
- Quick schema verification queries
- Checks tables, columns, and functions
- **Use case**: Verify migration success

### 🔧 Development Scripts

**disable-rls-mvp.sql** ⚠️
- Disables Row Level Security on all tables
- **WARNING**: Only for development/testing!
- **NEVER** run in production
- **Use case**: Local development when RLS blocks queries

## Usage

### Run Diagnostic

```bash
# Via Supabase Dashboard SQL Editor
# Copy/paste content of DIAGNOSTIC_COMPLET.sql
# Click RUN
# Review all results
```

### Disable RLS (Development Only)

```sql
-- In Supabase SQL Editor
\i supabase/scripts/disable-rls-mvp.sql

-- Or copy/paste content and RUN
```

**After disabling RLS for development:**
```sql
-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- All should show: rowsecurity = false
```

### Re-enable RLS

```sql
-- Run the production RLS migration
\i supabase/migrations/005_enable_rls_policies.sql
```

## Important Notes

- ⚠️ Scripts in this folder modify database state - use carefully
- 🔍 Diagnostic scripts are read-only and safe
- 🔧 Development scripts (disable-rls) are ONLY for local testing
- 📝 Always backup before running modification scripts
- 🚫 NEVER disable RLS in production

## When to Use Each Script

| Script | When | Environment |
|--------|------|-------------|
| DIAGNOSTIC_COMPLET.sql | Before migrations, troubleshooting | Any |
| 000_verify_schema.sql | After migrations | Any |
| disable-rls-mvp.sql | RLS blocking dev work | Local ONLY |

## Adding New Scripts

When adding new scripts:

1. Use descriptive names
2. Add documentation header in the SQL file
3. Update this README
4. Mark clearly if script modifies data
5. Include safety checks if destructive

## See Also

- `/supabase/migrations/README.md` - Database migrations guide
- `/EDGE_FUNCTIONS_DEPLOYMENT.md` - Edge Functions setup
