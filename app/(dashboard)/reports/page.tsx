// app/(dashboard)/reports-analytics/page.tsx
"use client";

import UsersTable from "@/app/components/dashboard/MostRecentUser";
import Header from "@/app/components/layout/Header";

import BarChartCard from "@/app/components/reports/BarChartCard";
import ExportAllButton from "@/app/components/reports/ExportAllButton";
import LineChartCard from "@/app/components/reports/LineChartCard";

import { ReportSummaryCard } from "@/app/components/reports/ReportSummaryCard";
import { ReportTabs } from "@/app/components/reports/ReportTab";

import { Building2, BarChart2, ClipboardList, FileSearch } from "lucide-react";

export default function ReportsAnalyticsPage() {
  return (
    <section className="min-h-screen flex flex-col md:flex-row">
      <main className="flex-1 p-4 space-y-6">
        <Header />

        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-500">
              View and analyze ESG reports submitted by companies
            </p>
          </div>
          <ExportAllButton />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportSummaryCard
            label="Reports Generated"
            value={10}
            changeText="+12% from last month"
            icon={<BarChart2 className="w-5 h-5" />}
            iconBgColor="bg-blue-100"
          />

          <ReportSummaryCard
            label="Published"
            value={3}
            changeText="+2 new this week"
            icon={<ClipboardList className="w-5 h-5" />}
            iconBgColor="bg-blue-100"
          />

          <ReportSummaryCard
            label="Under Review"
            value={7}
            changeText="+4 new this week"
            icon={<FileSearch className="w-5 h-5" />}
            iconBgColor="bg-gray-200"
          />

          <ReportSummaryCard
            label="Active Companies"
            value={6}
            changeText="+8% growth rate"
            icon={<Building2 className="w-5 h-5" />}
            iconBgColor="bg-yellow-100"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LineChartCard />
          <BarChartCard />
        </div>

        {/* Activity Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Activities
          </h2>
          <ReportTabs />
          {/* <ActivityTable /> */}
          <UsersTable />
        </div>
      </main>
    </section>
  );
}
