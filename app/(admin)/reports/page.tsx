"use client";

import { ReportSubmittedChart } from "@/app/components/common/dashboard/ReportSubmittedChart";
import Header from "@/app/components/layout/Header";
import ExportAllButton from "@/app/components/common/reports/ExportAllButton";
import LineChartCard from "@/app/components/common/reports/LineChartCard";
import ReportActivityTable from "@/app/components/common/reports/ReportActivityTable";
import { ReportSummaryCard } from "@/app/components/common/reports/ReportSummaryCard";
import { ReportTabs } from "@/app/components/common/reports/ReportTab";
import { motion } from "framer-motion";

export default function ReportsAnalyticsPage() {
  return (
    <section className="min-h-screen flex flex-col md:flex-row">
      <motion.main
        className="flex-1 p-4 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.5,
        }}
      >
        <Header />

        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500">
              View and analyze ESG reports submitted by companies
            </p>
          </div>
          <ExportAllButton />
        </div>
        {/* Report Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportSummaryCard
            label="Reports Generated"
            value={10}
            iconSrc="/icons/Analytics.svg"
            iconBgColor="bg-green-200"
            change={12}
            changeText="from last month"
          />

          <ReportSummaryCard
            label="Published"
            value={3}
            iconSrc="/icons/Report.svg"
            iconBgColor="bg-blue-100"
            change={2}
            changeText="new this week"
          />

          <ReportSummaryCard
            label="Under Review"
            value={7}
            iconSrc="/icons/UnderReview.svg"
            iconBgColor="bg-gray-100"
            change={4}
            changeText="new this week"
          />

          <ReportSummaryCard
            label="Active Companies"
            value={6}
            iconSrc="/icons/Company.svg"
            iconBgColor="bg-yellow-100"
            change={8}
            changeText="growth rate"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LineChartCard />
          <ReportSubmittedChart />
        </div>

        {/* Activity Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Activities
          </h2>
          <ReportTabs />
          <ReportActivityTable />
        </div>
      </motion.main>
    </section>
  );
}
