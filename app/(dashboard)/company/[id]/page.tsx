import { mockUsers } from "@/mockData/users";
import CompanyDetailsClient from "./CompanyDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const company = mockUsers.find((u) => String(u.id) === id);

  if (!company) {
    return <div className="p-6 text-red-500">Company not found</div>;
  }

  const users = mockUsers.filter((u) => u.company === company.company);

  return <CompanyDetailsClient company={company} users={users} />;
}
