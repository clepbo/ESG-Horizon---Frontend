import UserPieChart from "@/app/components/dashboard/UserPieChart";
import MostRecentCompany from "../../components/dashboard/MostRecentCompany";
import { RecentActivities } from "@/app/components/dashboard/RecentActivities";
import Header from "@/app/components/layout/Header";
import SubscriptionLineChart from "@/app/components/billing/SubscriptionLineChart";
import { IndustryLeaderboard } from "@/app/(dashboard-esg)/components/IndustryLeaderboard";
import { ReportSubmittedChart } from "@/app/components/dashboard/ReportSubmittedChart";
import { StatCard } from "@/app/components/dashboard/StatCard";
import Subscription from "@/app/components/dashboard/Subscription";
import subscriptionData from "@/mockData/subscriptionData";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* <Sidebar /> */}
      <main className="flex-1 p-4 space-y-4">
        <Header />

        <div>
          <h3>Users</h3>
          {/* StatCard + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatCard
                title="Admins"
                value={4}
                trend="up"
                trendValue="10%"
                iconSrc="/icons/Admin.svg"
                gradientClass="from-neutral-1000 to-neutral-800"
                bottomBarColor="bg-neutral-1000"
              />

              <StatCard
                title="ESG Company"
                value={25}
                trend="down"
                trendValue="7%"
                iconSrc="/icons/Company.svg"
                gradientClass="from-green-700  to-green-500"
                bottomBarColor="bg-green-800"
              />

              <StatCard
                title="Regulators"
                value={5}
                trend="up"
                trendValue="10%"
                iconSrc="/icons/Regulator.svg"
                gradientClass="from-[var(--color-gold-400)] to-[var(--color-gold-300)]"
                bottomBarColor="bg-[var(--color-gold-400)]"
              />

              <StatCard
                title="Investors"
                value={10}
                trend="up"
                trendValue="10%"
                iconSrc="/icons/Investor.svg"
                gradientClass="from-blue-600 to-blue-500"
                bottomBarColor="bg-blue-600"
              />
            </div>
            <UserPieChart />
          </div>
        </div>
        {/* Reports and Assessment */}
        <div>
          <h3>Reports and Assessment</h3>
          <div className="mt-6">
            <ReportSubmittedChart />
          </div>
        </div>

        <div className="mt-6">
          <h3>Subscriptions</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="">
              {/* Subscription Card */}
              <Subscription
                monthlyRevenue={subscriptionData.monthlyRevenue}
                stats={subscriptionData.stats}
              />
            </div>
            <SubscriptionLineChart />
          </div>
        </div>
        {/* Recent Activities and Industry Leaderboard */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {/* Recent Activities */}
          <div className=" h-full">
            <RecentActivities />
          </div>

          {/* Industry Leaderboard */}
          <div className=" h-full">
            <IndustryLeaderboard />
          </div>
        </section>

        {/* RecentUsersTable component (to build) */}
        <MostRecentCompany />
      </main>
    </div>
  );
}
