"use client";

import { AssessmentTable } from "@/app/components/company/assessments/AssessmentTable";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { useAssessments } from "@/services/hooks/assessment.hooks";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { AssessmentData } from "@/hooks/useAssessment";
import Header from "../components/Header";
import { motion } from "framer-motion";

export default function NewAssessmentPage() {
  const router = useRouter();
  const { data: assessments, isLoading, isError } = useAssessments();

  const tableData =
    assessments?.map((a: Partial<AssessmentData>) => ({
      id: a.id,
      startPeriod: `${a.startMonth}, ${a.startYear}`,
      endPeriod: `${a.endMonth}, ${a.endYear}`,
      subsidiary: a.subsidiary || "—",
      status:
        a.status === "submitted"
          ? "Awaiting Review"
          : a.status === "reviewed"
          ? "Completed"
          : "In Progress",
    })) ?? [];

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
        <Card className="max-w-6xl w-full p-12 text-center rounded-md bg-white border-none mb-10 shadow-md">
          <CardContent>
            <h1 className="text-2xl font-bold mb-6 text-neutral-1000">
              Start a New Assessment
            </h1>
            <p className="text-sm text-gray-600 mb-10 leading-relaxed">
              Start a fresh assessment to measure your company&apos;s
              environmental, social, and governance performance. Select the
              scope, reporting period, and assign responsibilities to your team.
            </p>
            <Button
              onClick={() => router.push("/assessments/hub")}
              className="bg-green-500 text-white hover:bg-green-700 px-8 py-4 text-sm rounded-sm"
            >
              Start New Assessment
            </Button>
          </CardContent>
        </Card>

        <div className="max-w-6xl w-full">
          <h4 className="font-semibold mb-6 text-neutral-1000">
            Recent Assessments
          </h4>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner size="lg" />
            </div>
          ) : isError ? (
            <p className="text-red-600">Failed to load assessments.</p>
          ) : !assessments || assessments.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No assessments</p>
          ) : (
            <AssessmentTable data={tableData} />
          )}
        </div>
      </motion.main>
    </div>
  );
}
