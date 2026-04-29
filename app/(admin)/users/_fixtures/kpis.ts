import type { AdminKpi } from "../../dashboard/_fixtures/kpis";

export const userKpis: AdminKpi[] = [
  { label: "Total Users", value: "148", trend: { direction: "up", text: "12 this month" } },
  { label: "Admins", value: "4", trend: { direction: "none", text: "Platform administrators" } },
  {
    label: "Data Officers",
    value: "12",
    trend: { direction: "none", text: "Active data contributors" },
  },
  {
    label: "Pending Invites",
    value: "7",
    valueTone: "warning",
    trend: { direction: "none", text: "Awaiting acceptance" },
  },
];
