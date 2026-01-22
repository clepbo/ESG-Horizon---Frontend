import ComingSoon from "@/app/components/coming-soon";
import React from "react";
import { ReportResponse } from "@/types/report/reportResponse";

interface ReportLeadershipPillarProps {
  reportData?: ReportResponse;
}

export default function ReportLeadershipPillar({ reportData }: ReportLeadershipPillarProps) {
  return (
    <div>
      <ComingSoon />
    </div>
  );
}
