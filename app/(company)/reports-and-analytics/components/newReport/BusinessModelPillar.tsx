import ComingSoon from "@/app/components/coming-soon";
import React from "react";
import { ReportResponse } from "@/types/report/reportResponse";

interface BusinessModelPillarProps {
  reportData?: ReportResponse;
}

export default function BusinessModelPillar({ }: BusinessModelPillarProps) {
  return (
    <div>
      <ComingSoon />
    </div>
  );
}
