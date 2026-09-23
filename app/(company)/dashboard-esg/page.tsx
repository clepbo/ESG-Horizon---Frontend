"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import ESGTour from "@/app/components/company/ESGTour";
import { isDemoMode } from "@/lib/demo";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useCompanyDashboard, CompanyDashboardData } from "@/services/hooks/dashboard.hooks";
import { useAssessments } from "@/services/hooks/assessment.hooks";
import { useReport } from "@/services/hooks/report.hooks";
import { useTargetsWithProgress } from "@/app/(company)/components/ranking/services";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";
import { FaLeaf } from "react-icons/fa";
import { PiUsersFill } from "react-icons/pi";
import { TbBriefcaseFilled } from "react-icons/tb";
import { HardHat } from "lucide-react";
import { VscLaw } from "react-icons/vsc";


// Dashboard components
import TotalEmissionCard from "./components/TotalEmissionCard";
import ESGScoreGauge from "./components/ESGScoreGauge";
import OverallProgressCard from "./components/OverallProgressCard";
import PillarScoresRow from "./components/PillarScoresRow";
import GHGEmissionsTrendChart from "./components/GHGEmissionsTrendChart";
import TargetTrendChart from "@/app/components/ui/charts/TargetTrendChart";
import ESGReportGrid from "./components/ESGReportGrid";
import AssessmentsList from "./components/AssessmentsList";
import DashboardRecentActivity from "./components/DashboardRecentActivity";
import { buildReportMetrics, buildEmissionTrend } from "./components/reportHelpers";


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
    // The demo should open on the dashboard itself. The welcome tour is a
    // setup checklist for a brand new account, which is the wrong first
    // impression when the whole point is to show a populated platform.
    if (isDemoMode) return false;
    return localStorage.getItem("esg-tour-completed") !== "true";
  });

  const { user } = useAuth();
  const { data, isLoading, isError } = useCompanyDashboard(!showTour);
  const { data: assessments } = useAssessments();

  const dashboard: CompanyDashboardData | undefined = useMemo(() => {
    if (!data) return undefined;

    const raw: any = "data" in data && typeof data.data !== "undefined" ? data.data : data;

    const normalized: CompanyDashboardData = {
      esgScore: raw.esgScore ?? null,
      esgGrade: raw.esgGrade ?? null,
      pillars: raw.pillars ?? null,
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

  // Fetch every target with computed progress so the dashboard reflects
  // the same numbers as /kpis and /reports — single source of truth.
  const { data: allTargets } = useTargetsWithProgress(user?.company?.id);

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

  const pillarScores = useMemo(() => {
    const p = dashboard?.pillars;
    return [
      {
        id: "environmental",
        name: "Environmental",
        score: Number(p?.environmental?.score ?? 0),
        maxScore: 100,
        color: "#1e8a3d",
        iconBg: "#f1fcf4",
        icon: <FaLeaf className="w-6 h-6" />,
        grade: p?.environmental?.grade,
        indicators: p?.environmental?.indicators,
      },
      {
        id: "social-capital",
        name: "Social Capital",
        score: Number(p?.socialCapital?.score ?? 0),
        maxScore: 100,
        color: "#2570eb",
        iconBg: "#eff5ff",
        icon: <PiUsersFill className="w-6 h-6" />,
        grade: p?.socialCapital?.grade,
        indicators: p?.socialCapital?.indicators,
      },
      {
        id: "human-capital",
        name: "Human Capital",
        score: Number(p?.humanCapital?.score ?? 0),
        maxScore: 100,
        color: "#F59E0B",
        iconBg: "#FEF9C3",
        icon: <HardHat className="w-6 h-6" />,
        grade: p?.humanCapital?.grade,
        indicators: p?.humanCapital?.indicators,
      },
      {
        id: "business-model",
        name: "Business Model",
        score: Number(p?.businessModel?.score ?? 0),
        maxScore: 100,
        color: "#af57db",
        iconBg: "#f5e2ff",
        icon: <TbBriefcaseFilled className="w-6 h-6" />,
        grade: p?.businessModel?.grade,
        indicators: p?.businessModel?.indicators,
      },
      {
        id: "leadership-governance",
        name: "Leadership & Governance",
        score: Number(p?.leadership?.score ?? 0),
        maxScore: 100,
        color: "#4a4a4a",
        iconBg: "#e8e8e8",
        icon: <VscLaw className="w-6 h-6" />,
        grade: p?.leadership?.grade,
        indicators: p?.leadership?.indicators,
      },
    ];
  }, [dashboard?.pillars]);

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
            <ESGScoreGauge score={dashboard?.esgScore ?? 0} grade={dashboard?.esgGrade} />
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
            <PillarScoresRow pillars={pillarScores} />
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
            <div className="rounded-2xl bg-white p-6 shadow-sm h-full flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reduction Targets Progress
              </h3>
              <div className="flex-1">
                <TargetTrendChart targets={allTargets ?? []} />
              </div>
            </div>
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
