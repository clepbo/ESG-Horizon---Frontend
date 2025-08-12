"use client";

import { Leaf, Users, Building } from "lucide-react";
// import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ESGCard } from "../components/ESGScoreCard";
import { ESGJourneyChart } from "../components/ESGJourneyChart";
import RecentActivities from "../components/RecentActivities";
import { IndustryLeaderboard } from "../components/IndustryLeaderboard";
import AssessmentHubCard from "@/app/(dashboard-esg)/components/AssessmentHubCard";
import ReportTable from "../components/ReportTab";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-[#F2FBF3] overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-6 mb-4">
        {/* Header */}
        <div className="flex gap-2">
          <h1 className="hidden lg:block">Dashboard</h1>
          <Header />
        </div>

        {/* ESG Scores + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-auto gap-4 justified-between items-stretch">
          <div className="grid gap-4 h-auto">
            <ESGCard
              title="Overall ESG Score"
              score={70}
              trend="up"
              maxScore={100}
              trendValue="10%"
              gradientClass="bg-gradient-to-b from-[#515451] to-[#303431] bg-fixed"
              iconSrc={"/icons/overall-esg.svg"}
              bottomBarColor="bg-[#333333]"
              icon={undefined}
              main={true}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
              <ESGCard
                title="Environmental"
                score={75}
                maxScore={100}
                trend="down"
                trendValue="7%"
                icon={<Leaf className="w-5 h-5" />}
                iconSrc={"/icons/overall-esg.svg"}
                bottomBarColor="bg-[#228A3D]"
                height="50px"
                gradientClass="bg-gradient-to-b from-[#409E56] to-[#248F3A] bg-fixed"
              />
              <ESGCard
                title="Social"
                score={62}
                maxScore={100}
                trend="up"
                trendValue="10%"
                icon={<Users className="w-5 h-5" />}
                gradientClass="bg-gradient-to-b from-[#D3B961] to-[#CBAA45] bg-fixed"
                bottomBarColor="bg-[#DCA54B]"
                iconSrc={"/icons/social.svg"} />
              <ESGCard
                title="Governance"
                score={67}
                maxScore={100}
                trend="up"
                trendValue="10%"
                gradientClass="bg-gradient-to-b from-[#4686E2] to-[#2671DD] bg-fixed"
                icon={<Building className="w-5 h-5" />}
                bottomBarColor="bg-[#2570EB]"
                iconSrc={"/icons/governance.svg"}
              />
            </div>

          </div>
          <div className="h-full">
            <ESGJourneyChart />
          </div>
        </div>

        {/* Recent Activities + Industry Leaderboard */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 mt-4 grid-rows-1">
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
