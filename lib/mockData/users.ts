export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  company: string;
  companyLogo: string;
  phone: string;
  permission: string;
  category?: string;
  avatar?: string;
  website?: string;
  address?: string;
  companyPhone?: string;
  companyEmail?: string;
  registrationNumber?: string;
  staff_strength?: string;
  industry?: string;
  activity?: string;
  contactPersonName?: string;
  recentActivities: {
    id: number;
    action: string;
    timestamp: string;
  }[];
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "Admin",
    status: "Approved",
    company: "ESG Solutions Inc",
    companyLogo: "/images/image2.png",
    phone: "+1 (555) 123-4567",
    permission: "Full Access",
    category: "ESG Company",
    avatar: "/images/image.png",
    website: "www.esgsolutions.com",
    address: "123 Green Street, Sustainability City, SC 12345",
    companyPhone: "+1 (555) 123-4500",
    companyEmail: "info@esgsolutions.com",
    registrationNumber: "ESG-001",
    staff_strength: "150",
    industry: "Environmental Consulting",
    contactPersonName: "Jane Doe",
    recentActivities: [
      { id: 1, action: "Logged in", timestamp: "2025-07-30T08:00:00Z" },
      {
        id: 2,
        action: "Updated profile",
        timestamp: "2025-07-30T09:00:00Z",
      },
    ],
  },
  {
    id: "2",
    name: "John Smith",
    email: "john@example.com",
    role: "Editor",
    status: "Suspended",
    company: "Green Investments Ltd",
    companyLogo: "/images/image2.png",
    phone: "+1 (555) 987-6543",
    permission: "Read Only",
    category: "Investor",
    avatar: "/images/image.png",
    website: "www.greeninvestments.com",
    address: "456 Investment Avenue, Finance District, FD 67890",
    companyPhone: "+1 (555) 987-6500",
    companyEmail: "contact@greeninvestments.com",
    registrationNumber: "GI-002",
    staff_strength: "75",
    industry: "Finance",
    contactPersonName: "John Smith",
    recentActivities: [
      {
        id: 1,
        action: "Submitted report",
        timestamp: "2025-07-29T10:00:00Z",
      },
    ],
  },
  {
    id: "3",
    name: "Joan Smith",
    email: "john@example.com",
    role: "Editor",
    status: "Under Review",
    company: "Yellow Investments Ltd",
    companyLogo: "/images/image2.png",
    phone: "+1 (555) 987-6543",
    permission: "Read Only",
    category: "Investor",
    avatar: "/images/image.png",
    website: "www.greeninvestments.com",
    address: "456 Investment Avenue, Finance District, FD 67890",
    companyPhone: "+1 (555) 987-6500",
    companyEmail: "contact@yellowinvestments.com",
    registrationNumber: "GI-002",
    staff_strength: "75",
    industry: "Oil & Gas",
    contactPersonName: "Joan Smith",
    recentActivities: [
      {
        id: 1,
        action: "Submitted report",
        timestamp: "2025-07-29T10:00:00Z",
      },
    ],
  },
  {
    id: "4",
    name: "Nancy Smith",
    email: "nancy@example.com",
    role: "Viewer",
    status: "Pending",
    company: "Blue Investments Ltd",
    companyLogo: "/images/image2.png",
    phone: "+1 (555) 987-6543",
    permission: "Read Only",
    category: "Regulator",
    avatar: "/images/image.png",
    website: "www.greeninvestments.com",
    address: "456 Investment Avenue, Finance District, FD 67890",
    companyPhone: "+1 (555) 987-6500",
    companyEmail: "contact@greeninvestments.com",
    registrationNumber: "GI-002",
    staff_strength: "75",
    industry: "Retail",
    contactPersonName: "Nancy Smith",
    recentActivities: [
      {
        id: 1,
        action: "Submitted report",
        timestamp: "2025-07-29T10:00:00Z",
      },
    ],
  },
];
