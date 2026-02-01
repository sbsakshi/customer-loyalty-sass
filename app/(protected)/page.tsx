import { getDashboardStats, getRecentTransactions } from "@/lib/dashboard-stats";
import DashboardContent from "@/components/DashboardContent";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const [stats, recentTransactions] = await Promise.all([
        getDashboardStats(),
        getRecentTransactions(5)
    ]);

    return (
        <DashboardContent
            customerCount={stats.customerCount}
            pointsDistributed={stats.pointsDistributed}
            recentTransactions={recentTransactions}
        />
    );
}
