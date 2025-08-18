// /mockData/mockReports.ts
export type Report = {
  id: number;
  title: string;
  company: string;
  type: string;
  submissionDate: string;
  status: string;
};

export const mockReports: Report[] = [
  {
    id: 1,
    title: "Q3 2024 ESG Performance Report",
    company: "GreenTech Solutions",
    type: "Quarterly",
    submissionDate: "2021-01-01",
    status: "Published",
  },
  {
    id: 2,
    title: "2024 Sustainability Snapshot",
    company: "EcoBuild Limited",
    type: "Annual",
    submissionDate: "2020-08-08",
    status: "Rejected",
  },
  {
    id: 3,
    title: "H1 2024 Social Impact Report",
    company: "BlueEarth Corp",
    type: "Bi-Annual",
    submissionDate: "2025-12-12",
    status: "Under Review",
  },
  {
    id: 4,
    title: "Q2 2024 Environmental Data Submission",
    company: "ClearWater Technologies",
    type: "Sustainability",
    submissionDate: "2020-08-08",
    status: "Approved",
  },
  {
    id: 5,
    title: "2023 Governance and Compliance Summary",
    company: "SafeGrid Partners",
    type: "Compliance",
    submissionDate: "2022-10-10",
    status: "Draft",
  },
];
