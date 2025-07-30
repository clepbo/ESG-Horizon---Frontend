// mockData/users.ts

export interface User {
  id: string;
  name: string;
  company: string;
  companyLogo: string;
  category: string;
  role: string;
  permission: string;
  email: string;
  phone: string;
  status: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Darlene Robertson",
    company: "Teasoo Consulting",
    companyLogo: "/images/image2.png",
    category: "Admin",
    role: "Admin",
    permission: "Admin",
    email: "deanna.curtis@example.com",
    phone: "(684) 555-0102",
    status: "Approved",
  },
  {
    id: "2",
    name: "Joe John",
    company: "Teasoo Consulting",
    companyLogo: "/images/image2.png",
    category: "Admin",
    role: "Admin",
    permission: "Admin",
    email: "deanna.curtis@example.com",
    phone: "(684) 555-0102",
    status: "Suspended",
  },
  {
    id: "3",
    name: "Darlene Robertson",
    company: "Teasoo Consulting",
    companyLogo: "/images/image2.png",
    category: "Admin",
    role: "Admin",
    permission: "Admin",
    email: "deanna.curtis@example.com",
    phone: "(684) 555-0102",
    status: "Under Review",
  },
  {
    id: "4",
    name: "Asa John",
    company: "Teasoo Consulting",
    companyLogo: "/images/image2.png",
    category: "Admin",
    role: "Admin",
    permission: "Admin",
    email: "deanna.curtis@example.com",
    phone: "(684) 555-0102",
    status: "Pending",
  },
];
