export type HealthStatus = "healthy" | "active" | "degraded" | "down" | "info";

export interface SystemHealthRow {
  label: string;
  value: string;
  status: HealthStatus;
}

export const systemHealth: SystemHealthRow[] = [
  { label: "API Response", value: "98ms avg", status: "healthy" },
  { label: "Database", value: "Healthy", status: "healthy" },
  { label: "Email Service", value: "Degraded", status: "degraded" },
  { label: "File Storage", value: "Healthy", status: "healthy" },
  { label: "Scoring Engine", value: "Active · v2.4.1", status: "active" },
  { label: "Last Backup", value: "Today 03:00 WAT", status: "info" },
];
