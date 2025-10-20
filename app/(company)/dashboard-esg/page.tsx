"use client";
import { useState } from "react";
import { Leaf, Users, Building } from "lucide-react";
import Header from "../components/Header";
import { ESGCard } from "../components/ESGScoreCard";
import { ESGJourneyChart } from "../components/ESGJourneyChart";
import RecentActivities from "../components/RecentActivities";
import AssessmentHubCard from "@/app/(company)/components/AssessmentHubCard";
import ReportTable from "../components/ReportTab";
import ESGTour from "@/app/components/company/ESGTour";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useCompanyDashboard } from "@/services/hooks/dashboard.hooks";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";

export default function DashboardPage() {
  const storedTourStatus = localStorage.getItem("esg-tour-completed");
  const hasUserOptedOut = storedTourStatus === "true";
  const initialShowTour = !hasUserOptedOut;
  const [showTour, setShowTour] = useState(initialShowTour);

  const { user } = useAuth();
  const { data, isLoading, isError } = useCompanyDashboard();

  const handleTourComplete = () => setShowTour(false);

  if (showTour) {
    return <ESGTour firstName={user?.first_name || ""} onComplete={handleTourComplete} />;
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F2FBF3] overflow-hidden">
      {/* Main Content */}

      <motion.main
        className="flex-1 h-full overflow-y-auto p-6 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.5,
        }}
      >
        {/* Header */}
        <div className="flex gap-2">
          <h1 className="hidden lg:block">Dashboard</h1>
          <Header showSearchBar={false} />
        </div>

        {/* ESG Scores + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-auto gap-4 justified-between items-stretch pt-10">
          <div className="grid gap-4 h-auto">
            <ESGCard
              title="Overall ESG Score"
              score={data.overallScore || 0}
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
                score={data.breakdown.environment || 0}
                maxScore={100}
                trend="down"
                trendValue="7%"
                icon={<Leaf className="w-5 h-5" />}
                iconSrc={"/icons/leafgreen.svg"}
                bottomBarColor="bg-[#228A3D]"
                height="50px"
                gradientClass="bg-gradient-to-b from-[#409E56] to-[#248F3A] bg-fixed"
              />
              <ESGCard
                title="Social"
                score={data.breakdown.social || 0}
                maxScore={100}
                trend="up"
                trendValue="10%"
                icon={<Users className="w-5 h-5" />}
                gradientClass="bg-gradient-to-b from-[#D3B961] to-[#CBAA45] bg-fixed"
                bottomBarColor="bg-[#DCA54B]"
                iconSrc={"/icons/social.svg"}
              />
              <ESGCard
                title="Governance"
                score={data.breakdown.governance || 0}
                maxScore={100}
                trend="up"
                trendValue="10%"
                gradientClass="bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary)] bg-fixed"
                icon={<Building className="w-5 h-5" />}
                bottomBarColor="bg-teal-600"
                iconSrc={"/icons/governance.svg"}
              />
            </div>
          </div>
          <div className="">
            <RecentActivities activities={data.recentActivities} />
          </div>
        </div>

        {/* Recent Activities + Industry Leaderboard */}
        <div className="w-full mt-6 mb-6">
          <ESGJourneyChart esgJourney={data.esgJourney} />
        </div>

        {/* Assessment HUb CArd */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Assessment Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AssessmentHubCard
              type="Environmental"
              description="Measure your environmental impact, resource usage and conservation efforts."
              progress={75}
              completed="6 of 8 sections completed"
              iconSrc={"/icons/leaftwo.svg"}
            />
            <AssessmentHubCard
              type="Social"
              description="Evaluate labor practices, human rights, community impact and product responsibility."
              progress={0}
              completed="0 sections completed"
              iconSrc={"/icons/userstwo.svg"}
            />
            <AssessmentHubCard
              type="Governance"
              description="Evaluate financial governance, market presence, procurement practices and more."
              progress={0}
              completed="0 sections completed"
              iconSrc={"/icons/injusticetwo.svg"}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
          <ReportTable />
        </div>
      </motion.main>
    </div>
  );
}
