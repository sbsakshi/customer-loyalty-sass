/**
 * Lazy point expiry utility
 *
 * This function expires points for a customer within a transaction.
 * It's called before any point operation (earn/redeem/balance check)
 * to ensure expired points are removed before the operation proceeds.
 *
 * NO WhatsApp notifications are sent here - notifications are only
 * sent via the weekly cron job.
 */

export async function expirePointsForCustomer(
  customerId: string,
  tx: any
): Promise<number> {
  const now = new Date();

  // Find all expired buckets for this customer
  const expiredBuckets = await tx.pointsBucket.findMany({
    where: {
      customerId,
      expiryDate: { lte: now },
      remainingPoints: { gt: 0 },
    },
    orderBy: { expiryDate: "asc" },
  });

  if (expiredBuckets.length === 0) {
    return 0; // No points to expire
  }

  // Calculate total expired points
  let totalExpired = 0;
  const bucketIdsToDelete: number[] = [];

  for (const bucket of expiredBuckets) {
    totalExpired += bucket.remainingPoints;
    bucketIdsToDelete.push(bucket.bucketId);
  }

  // 1. Delete expired buckets (they're gone from working data)
  await tx.pointsBucket.deleteMany({
    where: { bucketId: { in: bucketIdsToDelete } },
  });

  // 2. Update customer balance
  const customer = await tx.customer.update({
    where: { customerId },
    data: { totalPoints: { decrement: totalExpired } },
  });

  // 3. Record in transaction ledger (permanent audit trail)
  await tx.transactionLedger.create({
    data: {
      customerId,
      transactionType: "EXPIRY",
      points: -totalExpired,
      balanceAfter: customer.totalPoints,
      description: `Auto-expired ${expiredBuckets.length} bucket(s)`,
    },
  });

  return totalExpired;
}
