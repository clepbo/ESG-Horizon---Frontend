import type { AdminKpi } from "../../dashboard/_fixtures/kpis";

export const billingKpis: AdminKpi[] = [
  { label: "Monthly Revenue", value: "₦2.4M", trend: { direction: "up", text: "12% MoM" } },
  {
    label: "Active Subscriptions",
    value: "21",
    trend: { direction: "up", text: "7% vs last month" },
  },
  {
    label: "Pending Payments",
    value: "3",
    valueTone: "warning",
    trend: { direction: "none", text: "₦183k outstanding" },
  },
  {
    label: "Growth Rate",
    value: "+12%",
    valueTone: "success",
    trend: { direction: "none", text: "Month-on-month" },
  },
];
