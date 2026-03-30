"use client";

import React from "react";
import { ReportResponse } from "@/types/report/reportResponse";
import ReportOverview from "../newReport/ReportOverview";
import ReportEnvironmental from "../newReport/ReportEnvironmental";
import SocialCapital from "../newReport/SocialCapital";
import ReportHumanCapital from "../newReport/ReportHumanCapital";
import BusinessModelPillar from "../newReport/business-model/BusinessModelPillar";
import ReportLeadershipPillar from "../newReport/leadership/ReportLeadershipPillar";
import EvidenceAppendix from "./EvidenceAppendix";

interface ExportReportContentProps {
  reportData?: ReportResponse;
}

const sectionNames = [
  "overview",
  "environmental",
  "social-capital",
  "human-capital",
  "business-model",
  "leadership",
  "evidence-appendix",
] as const;

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  environmental: "Environmental",
  "social-capital": "Social Capital",
  "human-capital": "Human Capital",
  "business-model": "Business Model & Innovation",
  leadership: "Leadership & Governance",
  "evidence-appendix": "Appendix: Supporting Evidence",
};

/**
 * Renders ALL report tab content simultaneously (no lazy loading).
 * Used for PDF/PNG export — mounted in a hidden offscreen container.
 */
export default function ExportReportContent({ reportData }: ExportReportContentProps) {
  return (
    <div style={{ width: 1200, background: "#fff" }}>
      <div data-export-section="overview" style={{ marginBottom: 24 }}>
        <ReportOverview reportData={reportData} />
      </div>
      <div data-export-section="environmental" style={{ marginBottom: 24 }}>
        <ReportEnvironmental reportData={reportData} />
      </div>
      <div data-export-section="social-capital" style={{ marginBottom: 24 }}>
        <SocialCapital reportData={reportData} />
      </div>
      <div data-export-section="human-capital" style={{ marginBottom: 24 }}>
        <ReportHumanCapital reportData={reportData} />
      </div>
      <div data-export-section="business-model" style={{ marginBottom: 24 }}>
        <BusinessModelPillar reportData={reportData} />
      </div>
      <div data-export-section="leadership" style={{ marginBottom: 24 }}>
        <ReportLeadershipPillar reportData={reportData} />
      </div>
      <div data-export-section="evidence-appendix" style={{ marginBottom: 24 }}>
        <EvidenceAppendix evidence={reportData?.evidence} />
      </div>
    </div>
  );
}

export { sectionNames, sectionLabels };
