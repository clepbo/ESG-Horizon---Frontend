import { mockUsers } from "@/lib/mockData/users";
import Header from "@/app/components/layout/Header";
// import UserDetailsCard from "@/app/components/common/users/UserDetailsCard";
import BackButton from "@/app/components/ui/reusables/BackButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return mockUsers.map((user) => ({
    id: String(user.id),
  }));
}

export default async function UserDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const user = mockUsers.find((u) => String(u.id) === id);

  if (!user) {
    return <div className="p-6 text-red-500">User not found</div>;
  }

  return (
    <section className="flex flex-col gap-6 w-full p-4 md:p-6">
      <Header />
      <BackButton />
      <h2 className="text-2xl font-semibold">User Details</h2>
      {/* <UserDetailsCard user={user} /> */}
    </section>
  );
}
