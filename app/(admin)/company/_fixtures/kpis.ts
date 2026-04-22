import type { AdminKpi } from "../../dashboard/_fixtures/kpis";

export const companyKpis: AdminKpi[] = [
  { label: "Total Companies", value: "25", trend: { direction: "up", text: "4 this month" } },
  { label: "Approved", value: "18", trend: { direction: "none", text: "Active on platform" } },
  {
    label: "Pending Review",
    value: "5",
    valueTone: "warning",
    trend: { direction: "none", text: "Awaiting approval" },
  },
  {
    label: "Suspended",
    value: "2",
    valueTone: "danger",
    trend: { direction: "none", text: "Access restricted" },
  },
];
