export interface UserDistributionRow {
  label: string;
  percent: number;
  color: string;
}

export const userDistribution: UserDistributionRow[] = [
  { label: "ESG Companies", percent: 56.7, color: "#0d9488" },
  { label: "Investors", percent: 21.2, color: "#3b82f6" },
  { label: "Regulators", percent: 24.5, color: "#8b5cf6" },
  { label: "Admins", percent: 21.2, color: "#f59e0b" },
];
