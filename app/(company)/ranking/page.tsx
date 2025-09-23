"use client";

import { Leaf, Users, Building, BarChart3 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ESGScoreCard } from "../components/ESGScoreCard";
import { ESGJourneyChart } from "../components/ESGJourneyChart";
import RecentActivities from "../components/RecentActivities";
import { IndustryLeaderboard } from "../components/IndustryLeaderboard";
import AssessmentHubCard from "@/app/(company)/components/AssessmentHubCard";
import ReportTable from "../components/ReportTab";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-[#F2FBF3] overflow-hidden">
      {/* Sidebar */}
      {/* <Sidebar /> */}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-6">
        {/* Header */}
        <Header />

        {/* ESG Scores + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <ESGScoreCard
              title="Overall ESG Score"
              score={70}
              maxScore={100}
              trend="up"
              trendValue="10%"
              bgColor="bg-green-500"
              icon={<BarChart3 className="w-5 h-5" />}
            />
            <ESGScoreCard
              title="Environmental"
              score={75}
              maxScore={100}
              trend="down"
              trendValue="7%"
              bgColor="bg-green-500"
              icon={<Leaf className="w-5 h-5" />}
            />
            <ESGScoreCard
              title="Social"
              score={62}
              maxScore={100}
              trend="up"
              trendValue="10%"
              bgColor="bg-green-500"
              icon={<Users className="w-5 h-5" />}
            />
            <ESGScoreCard
              title="Governance"
              score={67}
              maxScore={100}
              trend="up"
              trendValue="10%"
              bgColor="bg-green-500"
              icon={<Building className="w-5 h-5" />}
            />
          </div>
          <ESGJourneyChart />
        </div>

        {/* Recent Activities + Industry Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 mt-4">
          <RecentActivities />
          <IndustryLeaderboard />
        </div>

        {/* Assessment HUb CArd */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Assessment Hub
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AssessmentHubCard
              type="Environmental"
              description="Measure your environmental impact, resource usage and conservation efforts."
              progress={75}
              completed="6 of 8 sections completed"
              icon={Leaf}
              iconBg="bg-green-500"
            />
            <AssessmentHubCard
              type="Social"
              description="Evaluate labor practices, human rights, community impact and product responsibility."
              progress={60}
              completed="4 of 10 sections completed"
              icon={Users}
              iconBg="bg-blue-500"
            />
            <AssessmentHubCard
              type="Governance"
              description="Evaluate financial governance, market presence, procurement practices and more."
              progress={55}
              completed="10 of 18 sections completed"
              icon={Building}
              iconBg="bg-yellow-500"
            />
          </div>
        </div>

        {/* Activity Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Report</h2>
          <ReportTable />
        </div>
      </main>
    </div>
  );
}
