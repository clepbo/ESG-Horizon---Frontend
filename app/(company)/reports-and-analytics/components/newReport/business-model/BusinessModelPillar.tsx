import React from "react";
import { ReportResponse } from "@/types/report/reportResponse";
import { TbBriefcaseFilled } from "react-icons/tb";
import BusinessEthicAndTransparency from "./BusinessEthicsAndTransparency";
import ClimaticImpactOnReserves from "./ClimateImpactOnReserves";
import { DocumentsSection } from "@/app/components/company/assessments/details/DocumentsSection";

interface BusinessModelPillarProps {
  reportData?: ReportResponse;
}

export default function BusinessModelPillar({ reportData }: BusinessModelPillarProps) {
  const businessModel = reportData?.businessModel;

  return (
    <div className="flex flex-col gap-4 lg:gap-6 my-6`">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="flex shrink-0 items-center justify-center rounded-lg p-2.5"
          style={{ backgroundColor: "#f5e2ff" }}
          aria-hidden
        >
          <TbBriefcaseFilled className="h-6 w-6 text-[#af57db] sm:h-7 sm:w-7" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            {" "}
            Business Model & Innovation
          </h2>
          <p className="text-sm text-gray-600 sm:text-base">
            Reserves resilience, capital allocation, and business ethics
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:gap-6">
        <div className="grid gap-2">
          <h3 className="text-lg"> Reserves Valuation & Capital Expenditures</h3>
          <hr className="text-gray-300" />
        </div>
        <BusinessEthicAndTransparency businessModel={businessModel} />
      </div>
      <div className="grid gap-4 lg:gap-6">
        <div className="grid gap-2">
          <h3 className="text-lg"> Business Ethics & Transparency </h3>
          <hr className="text-gray-300" />
        </div>
        <ClimaticImpactOnReserves businessModel={businessModel} />
      </div>

      <DocumentsSection
        files={reportData?.evidence?.businessModel ?? []}
        onFileClick={(file) => file.url && window.open(file.url, "_blank")}
      />
    </div>
  );
}
