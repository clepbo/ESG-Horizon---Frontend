import { Building, Scale, DollarSign, ShieldUser } from "lucide-react";
import StatCard from "@/app/components/dashboard/StatCard";
import UserPieChart from "@/app/components/dashboard/UserPieChart";
import MostRecentUsers from "../../components/dashboard/MostRecentUser";
import { RecentActivities } from "@/app/components/dashboard/RecentActivities";
import Header from "@/app/components/layout/Header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* <Sidebar /> */}
      <main className="flex-1 p-4 space-y-6">
        <Header />

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <StatCard icon={<ShieldUser />} label="Admins" value={4} />
          <StatCard
            icon={<Building />}
            label="ESG Company"
            value={25}
            change={10}
          />
          <StatCard icon={<Scale />} label="Regulators" value={5} change={10} />
          <StatCard
            icon={<DollarSign />}
            label="Investors"
            value={10}
            change={-9.05}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activities Card */}
          <div className="">
            <RecentActivities />
          </div>

          {/* Users Metrics Card */}
          <div className="mt-9">
            <UserPieChart />
          </div>
        </section>

        {/* RecentUsersTable component (to build) */}
        <MostRecentUsers />
      </main>
    </div>
  );
}
