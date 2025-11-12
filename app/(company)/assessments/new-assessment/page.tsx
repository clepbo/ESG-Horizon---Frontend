"use client";

import { AssessmentTable } from "@/app/components/company/assessments/AssessmentTable";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/services/hooks/assessment.hooks";
import { AssessmentData } from "@/hooks/useAssessment";
import Header from "../../components/Header";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentProvider } from "@/hooks/useAssessment";
import { getAssessmentProgressForTable } from "@/lib/utils";

function NewAssessmentPage() {
  const router = useRouter();
  const { data: assessments, isLoading, isError } = useAssessments();

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
        progress: getAssessmentProgressForTable(a),
        rejection_reason: (a as any).rejection_reason,
      };
    }) ?? [];

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

        <div className="space-y- mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Assessments Hub</h1>
          <p className="text-base text-muted-foreground">
            Track your ESG data collection progress across all pillars
          </p>
        </div>
        <Card className="max-w-4xl w-full mx-auto p-15 rounded-md bg-white border-none mb-10 shadow-md">
          <CardContent className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-6 text-neutral-1000">Welcome To Assessment</h1>
            {assessments && assessments.length > 0 ? (
              <p className="text-sm text-gray-600 mb-6 leading-relaxed text-center">
                Click on the button below to continue with creating assessments.
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-6 leading-relaxed text-center">
                It looks like you haven&apos;t started any yet. Click on the
                <br />
                button below to get started.
              </p>
            )}

            <Button
              onClick={() => router.push("/assessments/hub")}
              className="bg-[var(--color-primary)] transform hover:scale-[1.02] text-white px-8 py-4 text-sm rounded-sm"
            >
              Start New Assessment
            </Button>
            <p className="mt-6 text-sm text-gray-600 mb-10 leading-relaxed text-center">
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

        <div className="max-w-6xl w-full">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner size="lg" />
            </div>
          ) : isError ? (
            <p className="text-red-600">Failed to load assessments.</p>
          ) : !assessments || assessments.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No assessments. Start by using the button above.
            </p>
          ) : (
            <section>
              <h4 className="font-semibold mb-6 text-neutral-1000">Recent Assessments</h4>
              <AssessmentTable data={tableData} />
            </section>
          )}
        </div>
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
