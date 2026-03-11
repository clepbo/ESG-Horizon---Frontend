import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { formatNumberShort } from "@/lib/numberFormat";
import { STATUS_CONFIG } from "./constants";
import type { PillarTabId } from "./types";

interface InfoCardsRowProps {
  activeTabId: PillarTabId;
  assessmentData: any;
  fullAssessment: any;
}

export function InfoCardsRow({ activeTabId, assessmentData, fullAssessment }: InfoCardsRowProps) {
  const showEmissionsCard = activeTabId === "environmental";
  const submittedGroups: string[] = fullAssessment.submittedGroups || [];
  const totalSections = 20; // total form sections
  const completedCount = submittedGroups.length;
  const progressPct = assessmentData.overallProgress || 0;

  // Derive approximate counts
  const inProgressCount = Math.max(0, Math.round((progressPct / 100) * totalSections) - completedCount);
  const notStartedCount = Math.max(0, totalSections - completedCount - inProgressCount);

  // Status config for subsidiary card badge
  const statusConfig = STATUS_CONFIG[fullAssessment.status] || STATUS_CONFIG.in_progress;

  // Scope breakdown from assessmentData
  const scope1Total = assessmentData.scope1TotalEmission ?? assessmentData.environment?.ghg?.scope1?.calculated?.totalScope1Emission ?? 0;
  const scope2Total = assessmentData.scope2TotalEmission ?? assessmentData.environment?.ghg?.scope2?.calculated?.totalScope2Emission ?? 0;
  const scope3Total = assessmentData.scope3TotalEmission ?? assessmentData.environment?.ghg?.scope3?.calculated?.totalScope3Emission ?? 0;

  return (
    <div className={`grid grid-cols-1 gap-4 ${showEmissionsCard ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
      {/* ── Total Emissions — Environmental tab only ── */}
      {showEmissionsCard && (
        <Card className="bg-linear-to-br from-teal-500 to-emerald-600 text-white">
          <CardContent className="p-5">
            <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider">Total Emission</p>
            <p className="text-3xl font-bold mt-1">
              {formatNumberShort(assessmentData.totalEmission) || "0.00"}
            </p>
            <p className="text-teal-200 text-sm">tCO₂e</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge className="bg-teal-400/30 text-white border-0 text-[10px] px-2 py-0.5">
                Scope 1: {formatNumberShort(scope1Total)}
              </Badge>
              <Badge className="bg-teal-400/30 text-white border-0 text-[10px] px-2 py-0.5">
                Scope 2: {formatNumberShort(scope2Total)}
              </Badge>
              <Badge className="bg-teal-400/30 text-white border-0 text-[10px] px-2 py-0.5">
                Scope 3: {formatNumberShort(scope3Total)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Overall Progress ── */}
      <Card>
        <CardContent className="p-5">
          <p className="text-gray-900 text-xs font-semibold uppercase tracking-wider">Overall Progress</p>
          <div className="flex items-center gap-3 mt-2">
            <Progress value={progressPct} className="flex-1" />
            <span className="text-xl font-bold">{progressPct}%</span>
          </div>
          <p className="text-xs text-gray-800 mt-2">
            {completedCount} of {totalSections} sections completed
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-center">
              <p className="text-lg font-bold text-teal-600">{completedCount}</p>
              <p className="text-[10px] text-gray-800">Complete</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-500">{inProgressCount}</p>
              <p className="text-[10px] text-gray-800">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-700">{notStartedCount}</p>
              <p className="text-[10px] text-gray-800">Not Started</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Subsidiary ── */}
      <Card>
        <CardContent className="p-5">
          <p className="text-gray-900 text-xs font-semibold uppercase tracking-wider">Subsidiary</p>
          <p className="text-lg font-bold mt-1">{fullAssessment.subsidiary}</p>
          <Badge className={`${statusConfig.color} text-[10px] mt-1`}>{statusConfig.label}</Badge>
          {fullAssessment.reportingLead && (
            <p className="text-xs text-gray-800 mt-2">
              Reporting Lead: {fullAssessment.reportingLead}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Reporting Period ── */}
      <Card>
        <CardContent className="p-5">
          <p className="text-gray-900 text-xs font-semibold uppercase tracking-wider">Reporting Period</p>
          <p className="text-lg font-bold mt-1">
            {fullAssessment.startMonth} {fullAssessment.startYear} – {fullAssessment.endMonth}{" "}
            {fullAssessment.endYear}
          </p>
          {fullAssessment.quarter && (
            <p className="text-xs text-gray-800 mt-1">{fullAssessment.quarter}</p>
          )}
          {fullAssessment.submissionDeadline && (
            <p className="text-xs text-gray-800 mt-1">
              Submission Deadline{" "}
              <span className="text-red-500 font-medium">{fullAssessment.submissionDeadline}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
