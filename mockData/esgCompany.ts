// types/esg-company.ts
export interface ESGCompany {
  id: string;
  name: string;
  industry: string;
  sector: string;
  email: string;
  status: string;
  contactPerson: string;
  companyLogo: string;
  address: string;
  website: string;
  registrationNumber: string;
  companyPhone: string;
  companyEmail: string;
  staffStrength: string;
  departments: number;
  reportsPublished: number;
  subscriptionCount: number;
  esgScores: {
    overall: number;
    environmental: number;
    social: number;
    governance: number;
  };
  esgTrends: number[]; // for ESG Journey chart
  users: {
    name: string;
    email: string;
    role: string;
    recentActivity: string;
    status: string;
  }[];
}

export const mockESGCompanies: ESGCompany[] = [
  {
    id: "1",
    name: "Big Kahuna Burger Ltd.",
    industry: "Oil & Gas",
    sector: "Energy",
    email: "jessica.hanson@example.com",
    status: "Approved",
    contactPerson: "Eleanor Pena",
    companyLogo: "/images/image2.png",
    address: "123 Burger Lane, Food City, FC 10001",
    website: "www.bigkahunaburger.com",
    registrationNumber: "BKB-001",
    companyPhone: "+1 (555) 321-7654",
    companyEmail: "info@bigkahunaburger.com",
    staffStrength: "4",
    departments: 25,
    reportsPublished: 5,
    subscriptionCount: 10,
    esgScores: {
      overall: 70,
      environmental: 75,
      social: 62,
      governance: 67,
    },
    esgTrends: [60, 30, 40, 50, 70, 80, 60], // Jan–Jul
    users: [
      {
        name: "Kristin Watson",
        email: "sara.cruz@example.com",
        role: "Admin",
        recentActivity: "N/A",
        status: "Pending",
      },
      {
        name: "Albert Flores",
        email: "tim.jennings@example.com",
        role: "Admin",
        recentActivity: "Edited user permissions",
        status: "Suspended",
      },
      {
        name: "Jenny Wilson",
        email: "nevaeh.simmons@example.com",
        role: "Editor",
        recentActivity: "Suspended ESG Company user",
        status: "Approved",
      },
      {
        name: "Cody Fisher",
        email: "debbie.baker@example.com",
        role: "Viewer",
        recentActivity: "N/A",
        status: "Pending",
      },
      {
        name: "Arlene McCoy",
        email: "alma.lawson@example.com",
        role: "Editor",
        recentActivity: "Added new ESG company",
        status: "Approved",
      },
    ],
  },
  // Add more companies here if needed
];
