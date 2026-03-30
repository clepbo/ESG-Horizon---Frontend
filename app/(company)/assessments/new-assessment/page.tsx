"use client";

import { useEffect, useRef } from "react";
import AssessmentTable from "@/app/components/company/assessments/AssessmentTable";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/services/hooks/assessment.hooks";
import Header from "../../components/Header";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProvider, useAssessment } from "@/hooks/useAssessment";
import { UserTasksCoordinator } from "@/app/components/company/assessments/UserTasksCoordinator";
import { useMyTasks } from "@/services/hooks/assignTask.hooks";
import { useAuth } from "@/context/AuthContext";
import { getAssessmentProgressForTable } from "@/lib/utils";
import { useRoles } from "@/lib/roles";
import PermissionTooltip from "@/app/components/ui/PermissionTooltip";

function NewAssessmentPage() {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const { data: assessments, isLoading, isError } = useAssessments();
  const { data: userTasks, isLoading: tasksLoading, isError: tasksError } = useMyTasks();

  // Track if we've already done the initial redirect
  const hasRedirected = useRef(false);

  // Determine if user has assigned tasks
  const hasAssignedTasks = userTasks && userTasks.length > 0;
  const hasAssessments = assessments && assessments.length > 0;

  const { user } = useAuth();
  const { canWriteData, isCompanyAdmin } = useRoles();
  const canCreate = canWriteData;

  // Auto-redirect to my-tasks view if user has assigned tasks (only on initial load)
  useEffect(() => {
    if (
      !tasksLoading &&
      hasAssignedTasks &&
      state.currentView === "hub" &&
      !hasRedirected.current &&
      !isCompanyAdmin // Prevent redirect for admin
    ) {
      hasRedirected.current = true;
      dispatch({ type: "SET_VIEW", payload: "my-tasks" });
    }
  }, [hasAssignedTasks, tasksLoading, state.currentView, dispatch, isCompanyAdmin]);

  // Add safeguards to escape task view if admin
  useEffect(() => {
    if (isCompanyAdmin && (state.currentView === "my-tasks" || state.isAssignedTask)) {
      dispatch({ type: "SET_VIEW", payload: "hub" });
      dispatch({ type: "SET_ASSIGNED_TASK", payload: false });
    }
  }, [isCompanyAdmin, state.currentView, state.isAssignedTask, dispatch]);
  const isInTaskFlow = state.currentView === "my-tasks" || state.isAssignedTask;

  if (isInTaskFlow) {
    return (
      <UserTasksCoordinator
        onBack={() => {
          // Clear the assigned task flag and go back to hub
          dispatch({ type: "SET_ASSIGNED_TASK", payload: false });
          dispatch({ type: "SET_VIEW", payload: "hub" });
        }}
      />
    );
  }

  const tableData =
    assessments?.map((a: any) => {
      const startPeriod =
        a.startMonth && a.startYear
          ? `${a.startMonth}, ${a.startYear}`
          : a.startMonth || a.startYear
            ? `${a.startMonth ?? a.startYear}`
            : "";

      const endPeriod =
        a.endMonth && a.endYear
          ? `${a.endMonth}, ${a.endYear}`
          : a.endMonth || a.endYear
            ? `${a.endMonth ?? a.endYear}`
            : "";

      const data = a.assessmentData ?? {};
      const activity = data.activityMetrics;
      const env = data.environment ?? data.environmental;
      const social = data.socialCapital ?? data.social;
      const human = data.humanCapital;
      const business = data.businessInnovation ?? data.businessModel;
      const leadership = data.leadershipGovernance;

      // Calculator auto-adds these keys to every object — filter them out
      // to detect only real user-entered form data (mirrors countFilledFields ignoredKeys)
      const CALC_KEYS = new Set(["totalEmission", "totalEmissions", "progress", "calculated", "dataCount", "status", "breakdown"]);
      const hasUserData = (obj: any): boolean =>
        !!obj && Object.keys(obj).some((k) => !CALC_KEYS.has(k));

      const hasActivity = hasUserData(activity);

      // Environment: the calculator scaffolds the full GHG tree on every save
      // (scope1.stationarySources = { totalEmission: 0, progress: 0 }, etc.)
      // so we must check each group for keys beyond totalEmission/progress.
      const hasEnv = (() => {
        if (!env) return false;
        if (hasUserData(env.airQuality)) return true;
        if (hasUserData(env.waterManagement)) return true;
        if (hasUserData(env.biodiversityImpact)) return true;
        const ghg = env.ghg;
        if (!ghg) return false;
        const hasScopeData = (scope: any, groups: string[]) =>
          scope && groups.some((g: string) => hasUserData(scope[g]));
        if (hasScopeData(ghg.scope1, ["stationarySources", "mobileSources", "processEmissions", "fugitiveEmissions"])) return true;
        if (hasScopeData(ghg.scope2, ["locationBased", "marketBased"])) return true;
        if (hasScopeData(ghg.scope3, ["upstream", "downstream"])) return true;
        return false;
      })();

      const hasSocial = hasUserData(social);
      const hasHuman = hasUserData(human);
      const hasBusiness = hasUserData(business);
      const hasLeadership = hasUserData(leadership?.criticalIncidentRiskManagement);
      const hasGovernance = hasUserData(leadership?.managementOfTheLegalAndRegulatoryEnvironment);

      const pillars: ("A" | "E" | "S" | "H" | "B" | "L" | "G")[] = [];
      if (hasActivity) pillars.push("A");
      if (hasEnv) pillars.push("E");
      if (hasSocial) pillars.push("S");
      if (hasHuman) pillars.push("H");
      if (hasBusiness) pillars.push("B");
      if (hasLeadership) pillars.push("L");
      if (hasGovernance) pillars.push("G");

      return {
        id: a.id,
        startPeriod,
        endPeriod,
        subsidiary: a.subsidiary || "—",
        status: a.status || "in_progress",
        progress: getAssessmentProgressForTable(a),
        rejection_reason: (a as any).rejection_reason,
        lastUpdated: a.updatedAt,
        submittedAt: a.submittedAt ?? null,
        approvedAt: a.approvedAt ?? null,
        pillars,
      };
    }) ?? [];

  // Extract the company's review toggle from the first assessment (same for all)
  const requireAssessmentReview =
    (assessments as any[])?.[0]?.company?.requireAssessmentReview ?? true;

  if (isLoading || tasksLoading) {
    return (
      <div className="flex h-screen bg-green-50 overflow-hidden">
        <motion.main
          className="flex-1 h-full overflow-y-auto p-6"
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
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </motion.main>
      </div>
    );
  }

  if (isError || tasksError) {
    return (
      <div className="flex h-screen bg-green-50 overflow-hidden">
        <motion.main
          className="flex-1 h-full overflow-y-auto p-6"
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
          <Card className="max-w-4xl w-full mx-auto p-15 rounded-md bg-white border-none mb-10 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-600 text-center">
                Failed to load {isError ? "assessments" : "tasks"}. Please try again later.
              </p>
            </CardContent>
          </Card>
        </motion.main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-green-50 overflow-hidden">
      <motion.main
        className="flex-1 h-full overflow-y-auto p-6"
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

        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Assessments Hub</h1>
          <p className="text-base text-muted-foreground">
            Track your ESG data collection progress across all pillars
          </p>
        </div>

        {!hasAssessments ? (
          <Card className="max-w-4xl w-full mx-auto p-15 rounded-md bg-white border-none mb-10 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h1 className="text-2xl font-bold mb-6 text-neutral-1000">Welcome To Assessments!</h1>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed text-center">
                It looks like you haven&apos;t started any yet. Click on the
                <br />
                button below to get started.
              </p>

              <div className="relative group">
                <Button
                  onClick={canCreate ? () => router.push("/assessments/hub") : undefined}
                  disabled={!canCreate}
                  className={`bg-primary transform hover:scale-[1.02] text-white px-8 py-4 text-sm rounded-sm ${!canCreate ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Start New Assessment
                </Button>
                {!canCreate && <PermissionTooltip message="Requires Data Officer or Admin role" />}
              </div>
              <p className="mt-6 text-sm text-gray-600 leading-relaxed text-center">
                Or, have a lot of data? You can also{" "}
                <strong
                  onClick={() => alert("Coming soon!")}
                  style={{ cursor: "pointer", color: "black", textDecoration: "none" }}
                >
                  Bulk Upload
                </strong>{" "}
                our assessments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-neutral-1000">Recent Assessments</h4>
              <div className="relative group">
                <Button
                  onClick={canCreate ? () => router.push("/assessments/hub") : undefined}
                  disabled={!canCreate}
                  className={`bg-primary text-white px-6 py-2 text-sm rounded-sm hover:scale-[1.02] transform ${!canCreate ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Start New Assessment
                </Button>
                {!canCreate && <PermissionTooltip message="Requires Data Officer or Admin role" />}
              </div>
            </div>
            <AssessmentTable data={tableData} requireAssessmentReview={requireAssessmentReview} />
          </div>
        )}
      </motion.main>
    </div>
  );
}

export default function Page() {
  return (
    <AssessmentProvider>
      <NewAssessmentPage />
    </AssessmentProvider>
  );
}
