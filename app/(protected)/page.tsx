import { getDashboardStats } from "@/lib/dashboard-stats";
import DashboardContent from "@/components/DashboardContent";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const { customerCount, pointsDistributed } = await getDashboardStats();

    return (
        <DashboardContent
            customerCount={customerCount}
            pointsDistributed={pointsDistributed}
        />
    );
}
