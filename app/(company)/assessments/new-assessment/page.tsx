"use client";

import { useEffect } from "react";
import AssessmentTable from "@/app/components/company/assessments/AssessmentTable";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/services/hooks/assessment.hooks";
import { AssessmentData } from "@/hooks/useAssessment";
import Header from "../../components/Header";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProvider, useAssessment } from "@/hooks/useAssessment";
import { UserTasksCoordinator } from "@/app/components/company/assessments/UserTasksCoordinator";
import { ClipboardList, PlusCircle } from "lucide-react";
import { useMyTasks } from "@/services/hooks/assignTask.hooks";

function NewAssessmentPage() {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const { data: assessments, isLoading, isError } = useAssessments();
  const { data: userTasks, isLoading: tasksLoading, isError: tasksError } = useMyTasks();

  // Determine if user has assigned tasks
  const hasAssignedTasks = userTasks && userTasks.length > 0;
  const hasAssessments = assessments && assessments.length > 0;

  // Auto-redirect to my-tasks view if user has assigned tasks
  useEffect(() => {
    if (!tasksLoading && hasAssignedTasks && state.currentView === "hub") {
      dispatch({ type: "SET_VIEW", payload: "my-tasks" });
    }
  }, [hasAssignedTasks, tasksLoading, state.currentView, dispatch]);

  if (state.currentView === "my-tasks") {
    return (
      <UserTasksCoordinator
        onBack={() => {
          dispatch({ type: "SET_VIEW", payload: "hub" });
        }}
      />
    );
  }

  const tableData =
    assessments?.map((a: Partial<AssessmentData>) => {
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

      return {
        id: a.id,
        startPeriod,
        endPeriod,
        subsidiary: a.subsidiary || "—",
        status: a.status || "in_progress",
        progress: a.assessmentData?.overallProgress ?? 0,
        rejection_reason: (a as any).rejection_reason,
      };
    }) ?? [];
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

        {/* Show Tasks Section if user has assigned tasks */}
        {hasAssignedTasks ? (
          <>
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                My Assigned Tasks
              </h1>
              <p className="text-base text-muted-foreground">
                You have {userTasks.length} pending {userTasks.length === 1 ? "task" : "tasks"} to
                complete
              </p>
            </div>

            <Card className="max-w-4xl w-full mx-auto p-8 rounded-md bg-white border-none mb-10 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-3 text-neutral-1000">
                  Ready to Work on Your Tasks?
                </h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed text-center max-w-md">
                  You have tasks assigned to you. Click below to view and complete them.
                </p>

                <Button
                  onClick={() => dispatch({ type: "SET_VIEW", payload: "my-tasks" })}
                  className="bg-primary transform hover:scale-[1.02] text-white px-8 py-4 text-sm rounded-sm"
                >
                  View My Tasks
                </Button>

                {/* Option to start new assessment if needed */}
                <div className="mt-8 pt-6 border-t border-gray-200 w-full text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Need to start a new assessment instead?
                  </p>
                  <Button
                    onClick={() => router.push("/assessments/hub")}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Start New Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Original Assessment Hub UI - only shown when no assigned tasks */}
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-semibold text-foreground">Assessments Hub</h1>
              <p className="text-base text-muted-foreground">
                Track your ESG data collection progress across all pillars
              </p>
            </div>

            {!hasAssessments ? (
              <Card className="max-w-4xl w-full mx-auto p-15 rounded-md bg-white border-none mb-10 shadow-md">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <h1 className="text-2xl font-bold mb-6 text-neutral-1000">
                    Welcome To Assessments!
                  </h1>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed text-center">
                    It looks like you haven&apos;t started any yet. Click on the
                    <br />
                    button below to get started.
                  </p>

                  <Button
                    onClick={() => router.push("/assessments/hub")}
                    className="bg-primary transform hover:scale-[1.02] text-white px-8 py-4 text-sm rounded-sm"
                  >
                    Start New Assessment
                  </Button>
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
              <div className="max-w-6xl w-full">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-semibold text-neutral-1000">Recent Assessments</h4>
                  <Button
                    onClick={() => router.push("/assessments/hub")}
                    className="bg-primary text-white px-6 py-2 text-sm rounded-sm hover:scale-[1.02] transform"
                  >
                    Start New Assessment
                  </Button>
                </div>
                <AssessmentTable data={tableData} />
              </div>
            )}
          </>
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
