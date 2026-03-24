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

      <div className="flex-1 divide-y divide-gray-100">
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
              className="flex items-center gap-4 py-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {assessment.subsidiary || "Assessment"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{period}</p>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#119B95] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{progress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
