"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import ESGTour from "@/app/components/company/ESGTour";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useCompanyDashboard, CompanyDashboardData } from "@/services/hooks/dashboard.hooks";
import { useAssessments } from "@/services/hooks/assessment.hooks";
import { useReport } from "@/services/hooks/report.hooks";
import { useLatestTargetPair } from "@/app/(company)/components/ranking/services";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";


// Dashboard components
import TotalEmissionCard from "./components/TotalEmissionCard";
import ESGScoreGauge from "./components/ESGScoreGauge";
import OverallProgressCard from "./components/OverallProgressCard";
import PillarScoresRow from "./components/PillarScoresRow";
import GHGEmissionsTrendChart from "./components/GHGEmissionsTrendChart";
import ReductionTargetDonut from "./components/ReductionTargetDonut";
import ESGReportGrid from "./components/ESGReportGrid";
import AssessmentsList from "./components/AssessmentsList";
import DashboardRecentActivity from "./components/DashboardRecentActivity";
import { buildReportMetrics, buildEmissionTrend } from "./components/reportHelpers";

// Mock data — only pillar scores still need mock (waiting on scoring backend)
import { MOCK_PILLAR_SCORES } from "./components/mockData";

const ROW_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function DashboardPage() {
  const [showTour, setShowTour] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("esg-tour-completed") !== "true";
  });

  const { user } = useAuth();
  const { data, isLoading, isError } = useCompanyDashboard(!showTour);
  const { data: assessments } = useAssessments();

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

  // Fetch the latest assessment's report for ESG Assessment Report cards
  const { data: report } = useReport(dashboard?.latestAssessmentId);

  // Fetch the latest targets for the Reduction Target donut
  const { data: targetPair } = useLatestTargetPair(user?.company?.id);

  // Build report metrics from real data
  const reportMetrics = useMemo(() => buildReportMetrics(report), [report]);

  // Total emissions from report
  const totalEmission = useMemo(() => {
    const ghg = report?.environmental?.greenhouseGasEmission;
    return {
      total: Number(ghg?.totalEmissions) || 0,
      scope1: Number(ghg?.scope1Emissions) || 0,
      scope2: Number(ghg?.scope2Emissions) || 0,
      scope3: Number(ghg?.scope3Emissions) || 0,
    };
  }, [report]);

  // GHG Emissions Trend from report history
  const emissionTrend = useMemo(() => buildEmissionTrend(report), [report]);

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

  const assessmentList = Array.isArray(assessments) ? assessments : [];

  return (
    <div className="flex h-screen bg-[#F2FBF3] overflow-hidden">
      <motion.main
        className="flex-1 h-full overflow-y-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex gap-2 mb-6">
          <h1 className="hidden lg:block text-2xl font-bold">Dashboard</h1>
          <Header showSearchBar={false} />
        </div>

        <div className="space-y-6">
          {/* Row 1: Summary Cards */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            variants={ROW_VARIANTS}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <TotalEmissionCard
              total={totalEmission.total}
              scope1={totalEmission.scope1}
              scope2={totalEmission.scope2}
              scope3={totalEmission.scope3}
            />
            <ESGScoreGauge score={dashboard?.overallScore ?? 0} />
            <OverallProgressCard
              hubStats={dashboard?.hubStats}
            />
          </motion.div>

          {/* Row 2: Pillar Scores */}
          <motion.div
            variants={ROW_VARIANTS}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <PillarScoresRow pillars={MOCK_PILLAR_SCORES} />
          </motion.div>

          {/* Row 3: GHG Trend + Reduction Target */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4"
            variants={ROW_VARIANTS}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <GHGEmissionsTrendChart data={emissionTrend} />
            <ReductionTargetDonut
              generalTarget={targetPair?.general}
              scopeTarget={targetPair?.scope}
            />
          </motion.div>

          {/* Row 4: ESG Assessment Report */}
          <motion.div
            variants={ROW_VARIANTS}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <ESGReportGrid metrics={reportMetrics} />
          </motion.div>

          {/* Row 5: Assessments + Recent Activity */}
          <motion.div
            className="flex flex-col lg:flex-row gap-4 pb-6"
            variants={ROW_VARIANTS}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <div className="w-full lg:w-[60%] min-w-0">
              <AssessmentsList assessments={assessmentList} />
            </div>
            <div className="w-full lg:w-[40%] min-w-0">
              <DashboardRecentActivity activities={dashboard?.recentActivities ?? []} />
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
