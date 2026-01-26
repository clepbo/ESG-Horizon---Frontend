import ComingSoon from "@/app/components/coming-soon";
import React from "react";
import { ReportResponse } from "@/types/report/reportResponse";
import { TbBriefcaseFilled } from "react-icons/tb";
import { VscLaw } from "react-icons/vsc";
import { ShieldCheck } from "lucide-react";


interface ReportLeadershipPillarProps {
  reportData?: ReportResponse;
}

export default function ReportLeadershipPillar({ }: ReportLeadershipPillarProps) {
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
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            {" "}
            Leadership & Governance
          </h2>
          <p className="text-sm text-gray-500 sm:text-base">
            Regulatory compliance, sustainability oversight, and critical risk management
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:gap-6">
        <div className="grid gap-2">
          <h3 className="text-lg"> Management of Legal & Regulatory Environment </h3>
          <hr className="text-gray-300" />
        </div>

      </div>
    </div>
  );
}
