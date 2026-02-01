import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Pagination
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Customer filter (optional - if not provided, gets all transactions)
        const customerId = searchParams.get("customerId");

        // Transaction type filter (EARN, REDEEM, EXPIRY or comma-separated)
        const transactionType = searchParams.get("type");

        // Date filters
        const datePreset = searchParams.get("datePreset"); // today, last7days, last30days, thisMonth, thisYear, custom
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Amount filters
        const minPoints = searchParams.get("minPoints");
        const maxPoints = searchParams.get("maxPoints");
        const minBillAmount = searchParams.get("minBillAmount");
        const maxBillAmount = searchParams.get("maxBillAmount");

        // Search
        const search = searchParams.get("search");

        // Sorting
        const sortBy = searchParams.get("sortBy") || "createdAt"; // createdAt, points, billAmount
        const sortOrder = searchParams.get("sortOrder") || "desc"; // asc, desc

        // Build where clause
        const where: Prisma.TransactionLedgerWhereInput = {};

        // Customer filter
        if (customerId) {
            where.customerId = customerId;
        }

        // Transaction type filter
        if (transactionType) {
            const types = transactionType.split(",").map(t => t.trim().toUpperCase());
            where.transactionType = { in: types };
        }

        // Date range filter
        const dateFilter = buildDateFilter(datePreset, startDate, endDate);
        if (dateFilter) {
            where.createdAt = dateFilter;
        }

        // Points filter
        if (minPoints || maxPoints) {
            where.points = {};
            if (minPoints) where.points.gte = parseInt(minPoints);
            if (maxPoints) where.points.lte = parseInt(maxPoints);
        }

        // Bill amount filter (only for EARN transactions)
        if (minBillAmount || maxBillAmount) {
            where.billAmount = {};
            if (minBillAmount) where.billAmount.gte = new Prisma.Decimal(minBillAmount);
            if (maxBillAmount) where.billAmount.lte = new Prisma.Decimal(maxBillAmount);
        }

        // Search in description
        if (search) {
            where.description = { contains: search, mode: "insensitive" };
        }

        // Build orderBy
        const orderBy: Prisma.TransactionLedgerOrderByWithRelationInput = {};
        if (sortBy === "points") {
            orderBy.points = sortOrder as Prisma.SortOrder;
        } else if (sortBy === "billAmount") {
            orderBy.billAmount = sortOrder as Prisma.SortOrder;
        } else {
            orderBy.createdAt = sortOrder as Prisma.SortOrder;
        }

        // Execute queries in parallel
        const [transactions, total, summary] = await Promise.all([
            prisma.transactionLedger.findMany({
                where,
                orderBy,
                take: limit,
                skip: offset,
                include: {
                    customer: {
                        select: {
                            name: true,
                            phoneNumber: true,
                        }
                    }
                }
            }),
            prisma.transactionLedger.count({ where }),
            // Get summary statistics for the filtered data
            prisma.transactionLedger.groupBy({
                by: ["transactionType"],
                where,
                _sum: { points: true },
                _count: true,
            }),
        ]);

        // Calculate summary stats
        const summaryStats = {
            totalEarned: 0,
            totalRedeemed: 0,
            totalExpired: 0,
            earnCount: 0,
            redeemCount: 0,
            expiryCount: 0,
        };

        summary.forEach((s) => {
            if (s.transactionType === "EARN") {
                summaryStats.totalEarned = s._sum.points || 0;
                summaryStats.earnCount = s._count;
            } else if (s.transactionType === "REDEEM") {
                summaryStats.totalRedeemed = Math.abs(s._sum.points || 0);
                summaryStats.redeemCount = s._count;
            } else if (s.transactionType === "EXPIRY") {
                summaryStats.totalExpired = Math.abs(s._sum.points || 0);
                summaryStats.expiryCount = s._count;
            }
        });

        // Get total bill amount for filtered EARN transactions
        const billAmountSum = await prisma.transactionLedger.aggregate({
            where: { ...where, transactionType: "EARN", billAmount: { not: null } },
            _sum: { billAmount: true },
        });

        return NextResponse.json({
            transactions,
            total,
            hasMore: offset + transactions.length < total,
            summary: {
                ...summaryStats,
                totalTransactions: total,
                totalBillAmount: billAmountSum._sum.billAmount?.toNumber() || 0,
            },
            filters: {
                customerId,
                transactionType,
                datePreset,
                startDate,
                endDate,
                minPoints,
                maxPoints,
                minBillAmount,
                maxBillAmount,
                search,
                sortBy,
                sortOrder,
            }
        });
    } catch (error) {
        console.error("Error fetching ledger:", error);
        return NextResponse.json(
            { error: "Failed to fetch transaction ledger" },
            { status: 500 }
        );
    }
}

function buildDateFilter(
    preset: string | null,
    startDate: string | null,
    endDate: string | null
): Prisma.DateTimeFilter | null {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    if (preset) {
        switch (preset) {
            case "today":
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                break;
            case "yesterday":
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
                break;
            case "last7days":
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                end = now;
                break;
            case "last30days":
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                end = now;
                break;
            case "last90days":
                start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                end = now;
                break;
            case "thisMonth":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            case "lastMonth":
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;
            case "thisYear":
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;
            case "lastYear":
                start = new Date(now.getFullYear() - 1, 0, 1);
                end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
                break;
            case "custom":
                if (startDate) start = new Date(startDate);
                if (endDate) end = new Date(endDate);
                break;
        }
    } else if (startDate || endDate) {
        if (startDate) start = new Date(startDate);
        if (endDate) end = new Date(endDate);
    }

    if (!start && !end) return null;

    const filter: Prisma.DateTimeFilter = {};
    if (start) filter.gte = start;
    if (end) filter.lte = end;

    return filter;
}
