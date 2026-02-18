// /mockData/mockReports.ts
export type Report = {
  id: number;
  title: string;
  company: string;
  /** Reporting period label shown in the table, e.g. \"Q3 2024\" */
  period: string;
  type: string;
  submissionDate: string;
  status: string;
  /** Display name for subsidiary (falls back to company if absent) */
  subsidiary?: string;
  /** Period for abbreviated display e.g. "Feb 25 - Mar 26" */
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
};

function abbr(month: string) {
  const s = (month || "").slice(0, 3);
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}
function shortYear(y: string) {
  return String(y || "").length >= 2 ? String(y).slice(-2) : String(y);
}

export function formatReportPeriod(r: Report): string {
  if (r.startMonth != null && r.startYear != null && r.endMonth != null && r.endYear != null) {
    return `${abbr(r.startMonth)} ${shortYear(r.startYear)} - ${abbr(r.endMonth)} ${shortYear(r.endYear)}`;
  }
  return r.submissionDate || "—";
}

export const mockReports: Report[] = [
  {
    id: 1,
    title: "Q3 2024 ESG Performance Report",
    company: "GreenTech Solutions",
    period: "Q3 2024",
    type: "Quarterly",
    submissionDate: "2021-01-01",
    status: "Published",
    startMonth: "Jul",
    startYear: "2024",
    endMonth: "Sep",
    endYear: "2024",
  },
  {
    id: 2,
    title: "2024 Sustainability Snapshot",
    company: "EcoBuild Limited",
    period: "2024",
    type: "Annual",
    submissionDate: "2020-08-08",
    status: "Rejected",
    startMonth: "Jan",
    startYear: "2024",
    endMonth: "Dec",
    endYear: "2024",
  },
  {
    id: 3,
    title: "H1 2024 Social Impact Report",
    company: "BlueEarth Corp",
    period: "H1 2024",
    type: "Bi-Annual",
    submissionDate: "2025-12-12",
    status: "Under Review",
    startMonth: "Jan",
    startYear: "2024",
    endMonth: "Jun",
    endYear: "2024",
  },
  {
    id: 4,
    title: "Q2 2024 Environmental Data Submission",
    company: "ClearWater Technologies",
    period: "Q2 2024",
    type: "Sustainability",
    submissionDate: "2020-08-08",
    status: "Approved",
    startMonth: "Apr",
    startYear: "2024",
    endMonth: "Jun",
    endYear: "2024",
  },
  {
    id: 5,
    title: "2023 Governance and Compliance Summary",
    company: "SafeGrid Partners",
    period: "2023",
    type: "Compliance",
    submissionDate: "2022-10-10",
    status: "Draft",
    startMonth: "Jan",
    startYear: "2023",
    endMonth: "Dec",
    endYear: "2023",
  },
];
