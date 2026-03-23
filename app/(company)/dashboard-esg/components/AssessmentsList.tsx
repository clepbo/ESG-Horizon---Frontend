"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { getAssessmentProgressForTable } from "@/lib/utils";

interface Assessment {
  id: number;
  subsidiary?: string;
  status: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  assessmentData?: any;
}

interface AssessmentsListProps {
  assessments: Assessment[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", label: "In Progress" },
  awaiting_review: { bg: "bg-blue-50", text: "text-blue-700", label: "Awaiting Review" },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Approved" },
  submitted_approved: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Approved" },
  declined: { bg: "bg-red-50", text: "text-red-700", label: "Declined" },
  unapproved_rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
};

const COMPLETED_STATUSES = ["approved", "submitted_approved"];

export default function AssessmentsList({ assessments }: AssessmentsListProps) {
  const items = assessments.slice(0, 5);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Assessments</h3>
        <Link
          href="/assessments"
          className="text-sm font-medium text-[#119B95] hover:underline inline-flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-700 text-center py-8">No assessments yet</p>
        )}

        {items.map((assessment) => {
          const style = STATUS_STYLES[assessment.status] ?? STATUS_STYLES.in_progress;
          const period = assessment.startMonth && assessment.startYear
            ? `${assessment.startMonth} ${assessment.startYear} - ${assessment.endMonth} ${assessment.endYear}`
            : "";
          const progress = COMPLETED_STATUSES.includes(assessment.status)
            ? 100
            : getAssessmentProgressForTable(assessment);

          return (
            <div
              key={assessment.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-900" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {assessment.subsidiary || "Assessment"}
                </p>
                <p className="text-xs text-gray-900 truncate">{period}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
                <div className="w-16">
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#119B95] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-700 text-right mt-0.5">{progress}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
