import DashboardNav from "@/components/dashboard/DashboardNav";
import StatsRow from "@/components/dashboard/StatsRow";
import RecoveryChart from "@/components/dashboard/RecoveryChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import IssueBreakdown from "@/components/dashboard/IssueBreakdown";
import CarrierPerformance from "@/components/dashboard/CarrierPerformance";
import InsightCard from "@/components/dashboard/InsightCard";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your shipping recoveries.</p>
        </div>

        <div className="space-y-6">
          {/* Stats Row */}
          <StatsRow />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chart */}
            <div className="lg:col-span-2">
              <RecoveryChart />
            </div>

            {/* Right Column - Activity */}
            <div>
              <ActivityFeed />
            </div>
          </div>

          {/* Secondary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IssueBreakdown />
            <CarrierPerformance />
          </div>

          {/* Insight Card */}
          <InsightCard />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
