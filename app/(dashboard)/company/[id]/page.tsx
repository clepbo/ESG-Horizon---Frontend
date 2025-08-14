import CompanyDetailsClient from "./CompanyDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <CompanyDetailsClient id={Number(id)} />;
}
