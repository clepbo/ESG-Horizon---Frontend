"use client";
import Header from "@/app/components/layout/Header";
import Users from "@/app/components/users/Users";

export default function UsersPage() {
  return (
    <section className="min-h-screen flex flex-col md:flex-row">
      {/* <Sidebar /> */}
      <main className="flex-1 p-4 space-y-6">
        <Header />

        <header>
          <h2 className="text-2xl font-semibold">Company</h2>
          <p className="text-sm text-muted-foreground">
            Manage platform users and their access permissions
          </p>
        </header>

        <Users />
      </main>
    </section>
  );
}
