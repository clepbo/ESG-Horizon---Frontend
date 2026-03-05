"use client";

import { useState, useMemo } from "react";
import { Leaf, Users, Building } from "lucide-react";
import Header from "../components/Header";
import { ESGCard } from "../components/ESGScoreCard";
import { ESGJourneyChart } from "../components/ESGJourneyChart";
import RecentActivities from "../components/RecentActivities";
import AssessmentHubCard from "@/app/(company)/components/AssessmentHubCard";
import ESGTour from "@/app/components/company/ESGTour";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useCompanyDashboard, CompanyDashboardData } from "@/services/hooks/dashboard.hooks";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";
import { RecentReportsWidget } from "@/app/components/common/reports/table/RecentReports";
import { ESG_SECTION_COUNTS } from "@/lib/esgSectionCounts";

export default function DashboardPage() {
  const [showTour, setShowTour] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("esg-tour-completed") !== "true";
  });

  const { user } = useAuth();
  const { data, isLoading, isError } = useCompanyDashboard(!showTour);

  const dashboard: CompanyDashboardData | undefined = useMemo(() => {
    if (!data) return undefined;

    const raw: any = "data" in data && typeof data.data !== "undefined" ? data.data : data;

    const normalized: CompanyDashboardData = {
      overallScore: raw.overallScore ?? null,
      breakdown: {
        environment: Number(raw.breakdown?.environment ?? 0),
        social: Number(raw.breakdown?.social ?? 0),
        governance: Number(raw.breakdown?.governance ?? 0),
      },
      recentActivities: Array.isArray(raw.recentActivities) ? raw.recentActivities : [],
      esgJourney: (raw.esgJourney || []).map((item: any) => ({
        period: String(item?.period ?? ""),
        score: Number(item?.score ?? 0),
      })),
      stats: {
        totalAssessments: Number(raw.stats?.totalAssessments ?? 0),
        reviewedAssessments: Number(raw.stats?.reviewedAssessments ?? 0),
      },
      hubStats: raw.hubStats ?? null,
      latestAssessmentId: raw.latestAssessmentId ?? null,
      latestAssessmentStatus: raw.latestAssessmentStatus ?? null,
    };

    return normalized;
  }, [data]);

  const esgJourney: { period: string; score: number }[] = (dashboard?.esgJourney || []).map(
    (d) => ({
      period: d.period || "",
      score: Number(d.score ?? 0) || 0,
    })
  );

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
  // console.log("Dashboard overall", data);

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
          <ESGJourneyChart esgJourney={esgJourney} />
        </div>

        {/* Assessment HUb CArd */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Assessment Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AssessmentHubCard
              type="Environmental"
              description="Measure your environmental impact, resource usage and conservation efforts."
              progress={dashboard?.hubStats?.environment?.progress ?? 0}
              totalSections={ESG_SECTION_COUNTS.E}
              pillarStatus={(dashboard?.hubStats?.environment?.status as "not-started" | "in-progress" | "completed") ?? "not-started"}
              assessmentStatus={dashboard?.latestAssessmentStatus}
              iconSrc={"/icons/leaftwo.svg"}
              assessmentId={dashboard?.latestAssessmentId}
            />
            <AssessmentHubCard
              type="Social"
              description="Evaluate labor practices, human rights, community impact and product responsibility."
              progress={dashboard?.hubStats?.social?.progress ?? 0}
              totalSections={ESG_SECTION_COUNTS.S}
              pillarStatus={(dashboard?.hubStats?.social?.status as "not-started" | "in-progress" | "completed") ?? "not-started"}
              assessmentStatus={dashboard?.latestAssessmentStatus}
              iconSrc={"/icons/userstwo.svg"}
              assessmentId={dashboard?.latestAssessmentId}
            />
            <AssessmentHubCard
              type="Governance"
              description="Evaluate financial governance, market presence, procurement practices and more."
              progress={dashboard?.hubStats?.governance?.progress ?? 0}
              totalSections={ESG_SECTION_COUNTS.G}
              pillarStatus={(dashboard?.hubStats?.governance?.status as "not-started" | "in-progress" | "completed") ?? "not-started"}
              assessmentStatus={dashboard?.latestAssessmentStatus}
              iconSrc={"/icons/injusticetwo.svg"}
              assessmentId={dashboard?.latestAssessmentId}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
          <RecentReportsWidget />
        </div>
      </motion.main>
    </div>
  );
}
