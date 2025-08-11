export type Department = {
  id: string;
  name: string;
  description: string;
  lead: string;
  email: string;
  teamSize: number;
  status: "Active" | "Inactive";
};

export const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Sustainability Team",
    description: "Handles ESG reporting and strategy",
    lead: "Theresa Webb",
    email: "tranthuy.nute@gmail.com",
    teamSize: 5,
    status: "Active",
  },
  {
    id: "2",
    name: "Compliance & Risk",
    description: "Monitors regulatory alignment",
    lead: "Leslie Alexander",
    email: "tienlapspktnd@gmail.com",
    teamSize: 2,
    status: "Inactive",
  },
];

export type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Approved" | "Pending" | "Suspended";
  activity: string;
  department: string;
};

export const mockTeamUsers: TeamUser[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Super Admin",
    status: "Approved",
    activity: "2 days ago",
    department: "Compliance & Risk",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Platform Admin",
    status: "Pending",
    activity: "5 hours ago",
    department: "Compliance & Risk",
  },
  {
    id: "3",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Platform Viewer",
    status: "Suspended",
    activity: "1 day ago",
    department: "Sustainability Team",
  },
];
