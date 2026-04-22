"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AdminNavbar from "../components/AdminNavbar";
import KpiCard from "./_components/KpiCard";
import ReportSubmissionsChart from "./_components/ReportSubmissionsChart";
import UserDistribution from "./_components/UserDistribution";
import RecentActivityCard from "./_components/RecentActivityCard";
import PendingActionsCard from "./_components/PendingActionsCard";
import LeaderboardCard from "./_components/LeaderboardCard";
import SystemHealthCard from "./_components/SystemHealthCard";
import { adminKpis } from "./_fixtures/kpis";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.first_name || "there";

  return (
    <>
      <AdminNavbar
        title="Overview Dashboard"
        subtitle="Platform health and key metrics at a glance"
      />

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {getGreeting()}, {firstName}
          </h2>
          <p className="text-sm text-gray-700 mt-0.5">
            Here&apos;s what&apos;s happening across the platform today
          </p>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {adminKpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <ReportSubmissionsChart />
          <UserDistribution />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <RecentActivityCard />
          <PendingActionsCard />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <LeaderboardCard />
          <SystemHealthCard />
        </section>
      </motion.div>
    </>
  );
}
