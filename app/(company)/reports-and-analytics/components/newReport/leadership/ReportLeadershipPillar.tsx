import React from "react";
import { ReportResponse } from "@/types/report/reportResponse";
import { VscLaw } from "react-icons/vsc";
import ManagementOfLegalRegulatory from "./ManagementOfLegalRegulatory";
import CriticalIncidentRiskManagement from "./CriticalIncidentRiskManagement";
import { DocumentsSection } from "@/app/components/company/assessments/details/DocumentsSection";

interface ReportLeadershipPillarProps {
  reportData?: ReportResponse;
}

export default function ReportLeadershipPillar({ reportData }: ReportLeadershipPillarProps) {
  const leadershipData = reportData?.leadershipAndGovernance;

  return (
    <div className="flex flex-col gap-4 lg:gap-6 my-6`">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="flex shrink-0 items-center justify-center rounded-lg p-2.5"
          style={{ backgroundColor: "#e8e8e8" }}
          aria-hidden
        >
          <VscLaw className="h-6 w-6 sm:h-7 sm:w-7" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl"> Leadership & Governance</h2>
          <p className="text-sm text-gray-600 sm:text-base">
            Regulatory compliance, sustainability oversight, and critical risk management
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:gap-6">
        <div className="grid gap-2">
          <h3 className="text-lg"> Management of Legal & Regulatory Environment </h3>
          <hr className="text-gray-300" />
        </div>
        <ManagementOfLegalRegulatory leadershipData={leadershipData} />
      </div>
      <div className="grid gap-4 lg:gap-6">
        <div className="grid gap-2">
          <h3 className="text-lg"> Critical Incident Risk Management </h3>
          <hr className="text-gray-300" />
        </div>
        <CriticalIncidentRiskManagement leadershipData={leadershipData} />
      </div>

      <DocumentsSection
        files={reportData?.evidence?.leadershipAndGovernance ?? []}
        onFileClick={(file) => file.url && window.open(file.url, "_blank")}
      />
    </div>
  );
}
