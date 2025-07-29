"use client";
import Header from "@/app/components/layout/Header";
import UsersTable from "@/app/components/users/UsersTable";

export default function UsersPage() {
  return (
    <section className="flex flex-col gap-6 w-full p-4 md:p-6">
      <Header />
      <header>
        <h2 className="text-2xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">
          Manage platform users and their access permissions
        </p>
      </header>

      <UsersTable />
    </section>
  );
}
