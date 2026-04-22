export type KpiValueTone = "default" | "success" | "warning" | "danger";

export interface AdminKpi {
  label: string;
  value: string;
  valueTone?: KpiValueTone;
  trend: {
    direction: "up" | "down" | "neutral" | "warning" | "none";
    text: string;
  };
}

export const adminKpis: AdminKpi[] = [
  { label: "Total Companies", value: "25", trend: { direction: "up", text: "4 this month" } },
  { label: "Active Users", value: "148", trend: { direction: "up", text: "12% MoM" } },
  { label: "Reports Submitted", value: "312", trend: { direction: "up", text: "18 this week" } },
  { label: "Active Subscriptions", value: "21", trend: { direction: "warning", text: "3 pending payments" } },
  { label: "Monthly Revenue", value: "₦2.4M", trend: { direction: "up", text: "12% vs last month" } },
];
