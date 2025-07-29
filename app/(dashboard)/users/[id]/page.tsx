"use client";

import { useParams } from "next/navigation";
import { mockUsers } from "@/mockData/users";
import Header from "@/app/components/layout/Header";
import UserDetailsCard from "@/app/components/users/UserDetailsCard";
import BackButton from "@/app/components/BackButton";

export default function UserDetailsPage() {
  const { id } = useParams();
  const user = mockUsers.find((u) => String(u.id) === String(id));

  if (!user) return <div className="p-6 text-red-500">User not found</div>;

  return (
    <section className="flex flex-col gap-6 w-full p-4 md:p-6">
      <Header />
      <BackButton />
      <h2 className="text-2xl font-semibold">User Details</h2>
      <UserDetailsCard user={user} />
    </section>
  );
}
