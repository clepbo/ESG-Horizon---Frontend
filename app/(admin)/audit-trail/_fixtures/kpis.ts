import type { AdminKpi } from "../../dashboard/_fixtures/kpis";

export const auditKpis: AdminKpi[] = [
  { label: "Total Events (30d)", value: "2,847", trend: { direction: "up", text: "12%" } },
  { label: "Unique Actors", value: "34", trend: { direction: "none", text: "" } },
  {
    label: "Critical Actions",
    value: "8",
    valueTone: "danger",
    trend: { direction: "none", text: "" },
  },
  {
    label: "Failed Attempts",
    value: "3",
    valueTone: "danger",
    trend: { direction: "none", text: "" },
  },
];
