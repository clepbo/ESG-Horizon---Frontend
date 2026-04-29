export type AuditModule = "Algorithm" | "Assessment" | "Auth" | "Roles" | "Reports" | "Users";
export type AuditStatus = "Success" | "Failed" | "Under Review";
export type AuditActorRole = "Super Admin" | "Sub Admin" | "Officer" | "Unknown";

export interface AuditEvent {
  id: string;
  timestamp: string; // ISO or pretty timestamp for now
  actor: {
    firstName: string;
    lastName: string;
    color: string;
    unknown?: boolean;
  };
  role: AuditActorRole;
  module: AuditModule;
  action: string;
  entity: string;
  status: AuditStatus;
}

export const auditEvents: AuditEvent[] = [
  {
    id: "ae_1",
    timestamp: "2025-07-17 11:45",
    actor: { firstName: "Efeosasere", lastName: "Okoro", color: "#0d9488" },
    role: "Super Admin",
    module: "Algorithm",
    action: "Modified pillar weights",
    entity: "v2.5 draft",
    status: "Success",
  },
  {
    id: "ae_2",
    timestamp: "2025-07-17 10:12",
    actor: { firstName: "Kristin", lastName: "Watson", color: "#3b82f6" },
    role: "Sub Admin",
    module: "Assessment",
    action: "Added new question",
    entity: "GHG Assessment v2.2",
    status: "Success",
  },
  {
    id: "ae_3",
    timestamp: "2025-07-17 08:55",
    actor: { firstName: "?", lastName: "?", color: "#ef4444", unknown: true },
    role: "Unknown",
    module: "Auth",
    action: "Failed login attempt",
    entity: "IP: 197.210.4.32",
    status: "Failed",
  },
  {
    id: "ae_4",
    timestamp: "2025-07-16 04:20",
    actor: { firstName: "Ngozi", lastName: "Okoro", color: "#f59e0b" },
    role: "Super Admin",
    module: "Roles",
    action: "Created new role",
    entity: "ESG Analyst",
    status: "Success",
  },
  {
    id: "ae_5",
    timestamp: "2025-07-16 02:10",
    actor: { firstName: "Albert", lastName: "Flores", color: "#a855f7" },
    role: "Officer",
    module: "Reports",
    action: "Submitted ESG report",
    entity: "Q2 2025 Environmental",
    status: "Under Review",
  },
];
