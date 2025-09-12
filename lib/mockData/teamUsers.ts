export type TeamUserStatus =
  | "Pending"
  | "Suspended"
  | "Approved"
  | "Under Review";

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  permission: string;
  company: string;
  role: string;
  status: TeamUserStatus;
  activity: string;
  department: string;
  avatar?: string;
  companyEmail?: string;
  companyPhone?: string;
  website?: string;
  registrationNumber?: string;
  staff_strength?: string;
  address?: string;
  companyLogo?: string;
}

export const teamUsers: TeamUser[] = [
  {
    id: "1",
    name: "Kristin Watson",
    email: "sara.cruz@example.com",
    phone: "555-0100",
    permission: "Admin",
    company: "Teasoo Consulting",
    role: "Super Admin",
    status: "Pending",
    activity: "N/A",
    department: "Administrator",
    companyEmail: "info@teasooconsulting.com",
    companyPhone: "555-1000",
    website: "www.teasooconsulting.com",
    registrationNumber: "RC123456",
    staff_strength: "20",
    address: "4, Oghosa Crescent, Off Ihama, GRA Benin City",
  },
  {
    id: "2",
    name: "Albert Flores",
    email: "tim.jennings@example.com",
    phone: "555-0101",
    permission: "Editor",
    company: "Teasoo Consulting",
    role: "Platform Admin",
    status: "Suspended",
    activity: "Edited user permissions",
    department: "Human Resources",
    companyEmail: "info@teasooconsulting.com",
    companyPhone: "555-1000",
    website: "www.teasooconsulting.com",
    registrationNumber: "RC123456",
    staff_strength: "20",
    address: "4, Oghosa Crescent, Off Ihama, GRA Benin City",
  },
  {
    id: "3",
    name: "Jenny Wilson",
    email: "nevaeh.simmons@example.com",
    phone: "555-0102",
    permission: "Manager",
    company: "Teasoo Consulting",
    role: "Platform Manager",
    status: "Approved",
    activity: "Suspended ESG Company user",
    department: "Sustainability",
    companyEmail: "info@teasooconsulting.com",
    companyPhone: "555-1000",
    website: "www.teasooconsulting.com",
    registrationNumber: "RC123456",
    staff_strength: "20",
    address: "4, Oghosa Crescent, Off Ihama, GRA Benin City",
  },
  {
    id: "4",
    name: "Cody Fisher",
    email: "debbie.baker@example.com",
    phone: "555-0103",
    permission: "Viewer",
    company: "Teasoo Consulting",
    role: "Platform Viewer",
    status: "Pending",
    activity: "N/A",
    department: "Digital",
    companyEmail: "info@teasooconsulting.com",
    companyPhone: "555-1000",
    website: "www.teasooconsulting.com",
    registrationNumber: "RC123456",
    staff_strength: "20",
    address: "4, Oghosa Crescent, Off Ihama, GRA Benin City",
  },
  {
    id: "5",
    name: "Arlene McCoy",
    email: "alma.lawson@example.com",
    phone: "555-0104",
    permission: "Viewer",
    company: "Teasoo Consulting",
    role: "Platform Viewer",
    status: "Approved",
    activity: "Added new ESG company",
    department: "Communication",
    companyEmail: "info@teasooconsulting.com",
    companyPhone: "555-1000",
    website: "www.teasooconsulting.com",
    registrationNumber: "RC123456",
    staff_strength: "20",
    address: "4, Oghosa Crescent, Off Ihama, GRA Benin City",
  },
];
