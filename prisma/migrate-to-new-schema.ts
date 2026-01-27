/**
 * Database Migration Script
 *
 * This script migrates from the old schema (PointsLedger) to the new schema
 * (TransactionLedger + PointsBucket).
 *
 * IMPORTANT: Backup your database before running this script!
 *
 * Usage:
 *   npx tsx prisma/migrate-to-new-schema.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrate() {
  console.log("🚀 Starting migration to new schema...\n");

  try {
    // Step 1: Check if old table exists and has data
    console.log("📊 Checking existing data...");

    let oldLedgerCount = 0;
    try {
      // @ts-ignore - old schema may not exist in types
      oldLedgerCount = await prisma.pointsLedger.count();
      console.log(`   Found ${oldLedgerCount} records in old PointsLedger table`);
    } catch (e) {
      console.log("   Old PointsLedger table not found or already migrated");
      oldLedgerCount = 0;
    }

    if (oldLedgerCount === 0) {
      console.log("\n✅ No data to migrate. You can proceed with fresh schema.");
      return;
    }

    // Step 2: Fetch all old ledger entries
    console.log("\n📥 Fetching old ledger entries...");
    // @ts-ignore
    const oldEntries = await prisma.pointsLedger.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Step 3: Migrate to TransactionLedger (all entries)
    console.log("\n📝 Migrating to TransactionLedger...");
    let transactionCount = 0;

    for (const entry of oldEntries) {
      await prisma.transactionLedger.create({
        data: {
          customerId: entry.customerId,
          transactionType: entry.transactionType,
          points: entry.points,
          balanceAfter: entry.balanceAfter,
          billAmount: entry.billAmount,
          description: entry.description,
          createdAt: entry.createdAt,
        },
      });
      transactionCount++;
    }

    console.log(`   ✓ Migrated ${transactionCount} entries to TransactionLedger`);

    // Step 4: Migrate to PointsBucket (only EARN with remainingPoints > 0)
    console.log("\n🪣 Creating PointsBuckets from active EARN entries...");
    let bucketCount = 0;

    const activeEarnEntries = oldEntries.filter(
      (entry: any) =>
        entry.transactionType === "EARN" &&
        entry.remainingPoints > 0 &&
        entry.expiryDate
    );

    for (const entry of activeEarnEntries) {
      await prisma.pointsBucket.create({
        data: {
          customerId: entry.customerId,
          pointsEarned: entry.points,
          remainingPoints: entry.remainingPoints,
          expiryDate: entry.expiryDate,
          earnedAt: entry.createdAt,
        },
      });
      bucketCount++;
    }

    console.log(`   ✓ Created ${bucketCount} active buckets`);

    // Step 5: Verify customer balances match
    console.log("\n🔍 Verifying customer balances...");
    const customers = await prisma.customer.findMany();

    for (const customer of customers) {
      const bucketTotal = await prisma.pointsBucket.aggregate({
        where: { customerId: customer.customerId },
        _sum: { remainingPoints: true },
      });

      const calculatedTotal = bucketTotal._sum.remainingPoints || 0;

      if (calculatedTotal !== customer.totalPoints) {
        console.warn(
          `   ⚠️  Balance mismatch for ${customer.name}: DB=${customer.totalPoints}, Buckets=${calculatedTotal}`
        );

        // Fix the mismatch
        await prisma.customer.update({
          where: { customerId: customer.customerId },
          data: { totalPoints: calculatedTotal },
        });
        console.log(`      ✓ Fixed balance to ${calculatedTotal}`);
      }
    }

    console.log("   ✓ All customer balances verified");

    // Step 6: Summary
    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • TransactionLedger entries: ${transactionCount}`);
    console.log(`   • Active PointsBuckets: ${bucketCount}`);
    console.log(`   • Customers processed: ${customers.length}`);

    console.log("\n⚠️  IMPORTANT: After verifying everything works:");
    console.log("   1. The old 'points_ledger' table is no longer used");
    console.log("   2. You can drop it manually when ready:");
    console.log("      DROP TABLE points_ledger;");
    console.log("\n   But keep it for now as a backup!");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
