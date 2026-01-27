# Database Migration Guide: Lazy Point Expiry with FIFO Buckets

## Overview

This migration implements a new architecture with:
- **TransactionLedger**: Immutable audit trail of all transactions
- **PointsBucket**: Mutable working table for FIFO point consumption
- **Lazy Expiry**: Points expire automatically during user interactions
- **FIFO Consumption**: Oldest points consumed first on redemption
- **Weekly Cron**: Optional cleanup job for notifications only

---

## What Changed

### Before (Old Schema)
```
PointsLedger
├─ All transactions (EARN/REDEEM/EXPIRY)
├─ remainingPoints field
├─ expiryDate field
└─ Never deleted
```

### After (New Schema)
```
TransactionLedger                PointsBucket
├─ Audit trail only              ├─ Only active EARN buckets
├─ No remainingPoints            ├─ remainingPoints for FIFO
├─ No expiryDate                 ├─ expiryDate
└─ Never deleted                 └─ Deleted when expired/consumed
```

---

## Migration Steps

### 1. Backup Your Database (CRITICAL!)

```bash
# For PostgreSQL
pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d).sql

# For development (if using SQLite)
cp prisma/dev.db prisma/dev.db.backup
```

### 2. Install Dependencies (if needed)

```bash
npm install -D tsx
```

### 3. Generate New Prisma Schema

```bash
npx prisma generate
npx prisma db push
```

This will create the new `transaction_ledger` and `points_buckets` tables while keeping the old `points_ledger` table intact.

### 4. Run Migration Script

```bash
npx tsx prisma/migrate-to-new-schema.ts
```

**What it does:**
- Copies all data from `points_ledger` → `transaction_ledger`
- Creates active buckets from EARN entries with `remainingPoints > 0`
- Verifies and fixes customer balances
- Keeps old table as backup

**Expected Output:**
```
🚀 Starting migration to new schema...
📊 Checking existing data...
   Found X records in old PointsLedger table
📝 Migrating to TransactionLedger...
   ✓ Migrated X entries to TransactionLedger
🪣 Creating PointsBuckets from active EARN entries...
   ✓ Created X active buckets
🔍 Verifying customer balances...
   ✓ All customer balances verified
✅ Migration completed successfully!
```

### 5. Test the System

#### Test Lazy Expiry
```bash
# Create a test bucket that's already expired
# Then try to redeem or earn points for that customer
# The expired points should be automatically removed
```

#### Test FIFO Redemption
```bash
# Create customer with 2 buckets:
# - 100 points expiring Jan 20
# - 50 points expiring Jan 25
# Redeem 110 points on Jan 18
# Expected: First bucket fully consumed (100), second bucket has 40 remaining
```

#### Test Reports
```bash
# Visit /reports page
# Should show correct stats including expired points
```

### 6. Verify Everything Works

Run your application and test:
- ✅ New customer registration
- ✅ Point earning (creates bucket + ledger entry)
- ✅ Point redemption (FIFO consumption)
- ✅ Balance checks
- ✅ Dashboard stats
- ✅ Reports page

### 7. Drop Old Table (Optional, after verification)

```sql
-- Only run this after you're 100% confident everything works!
DROP TABLE points_ledger;
```

---

## Setting Up Weekly Cron (Optional)

The new system works fine without a cron job (lazy expiry handles everything). The cron is **only for WhatsApp notifications** about expired points.

### Option 1: Vercel Cron (Recommended)

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/expiry",
    "schedule": "0 0 * * 0"
  }]
}
```
Runs every Sunday at midnight UTC.

### Option 2: GitHub Actions

Create `.github/workflows/weekly-cleanup.yml`:
```yaml
name: Weekly Point Expiry Cleanup
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - run: curl https://your-domain.com/api/cron/expiry
```

### Option 3: External Cron Service

- [cron-job.org](https://cron-job.org) - Free
- [EasyCron](https://www.easycron.com) - Free tier available

---

## Key Features of New System

### 1. Lazy Expiry
Points expire automatically when users:
- Earn points
- Redeem points
- Check balance (if implemented)

**No cron job needed for functionality!**

### 2. True FIFO Consumption
```
Example:
Bucket 1: 100 points (expires Jan 20)
Bucket 2: 50 points (expires Jan 25)

User redeems 110 points:
→ Bucket 1: DELETED (fully consumed)
→ Bucket 2: 40 remaining
→ Customer balance: 40 points
```

### 3. Separate Concerns
- **TransactionLedger**: Historical record, reports, compliance
- **PointsBucket**: Active working data for operations
- **Customer.totalPoints**: Source of truth for display

### 4. Performance Optimized
- Buckets table stays small (only active points)
- Fast FIFO queries with indexes
- Atomic transactions prevent race conditions

---

## Rollback Plan (If Something Goes Wrong)

### Before Dropping Old Table

If issues occur, you can:

1. **Revert code changes** (git revert/checkout)
2. **Restore old API endpoints** that use `pointsLedger`
3. **Keep using old schema** - the old table is still there!

### After Dropping Old Table

If you have backup:
```bash
# Restore from backup
psql -U your_user -d your_database < backup_YYYYMMDD.sql
```

---

## File Changes Summary

### New Files
- `lib/expirePoints.ts` - Lazy expiry utility
- `prisma/migrate-to-new-schema.ts` - Migration script
- `MIGRATION.md` - This file

### Modified Files
- `prisma/schema.prisma` - New table definitions
- `app/api/transactions/earn/route.ts` - Uses new schema
- `app/api/transactions/redeem/route.ts` - FIFO logic
- `app/api/cron/expiry/route.ts` - Weekly cleanup
- `app/(protected)/page.tsx` - Uses TransactionLedger
- `app/api/reports/route.ts` - Updated queries
- `prisma/seed.ts` - New test data

---

## Support

If you encounter issues:

1. Check migration script output for errors
2. Verify database tables were created correctly
3. Ensure customer balances match bucket totals
4. Review application logs for errors

**Questions?** Review the code comments in:
- `lib/expirePoints.ts` - Expiry logic
- `app/api/transactions/redeem/route.ts` - FIFO implementation

---

## Summary

✅ **Lazy Expiry** - No daily cron needed
✅ **FIFO Consumption** - Oldest points consumed first
✅ **Clean Architecture** - Audit trail vs working data
✅ **Performance** - Small buckets table, fast queries
✅ **Optional Cron** - Only for notifications, not critical

**You're ready to deploy!** 🚀
