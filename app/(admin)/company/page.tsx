"use client";
import Header from "@/app/components/layout/Header";
import Users from "@/app/components/common/users/Users";
import { motion } from "framer-motion";

export default function UsersPage() {
  return (
    <section className="min-h-screen flex flex-col md:flex-row">
      {/* <Sidebar /> */}

      <motion.main
        className="flex-1 p-4 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.5,
        }}
      >
        <Header />

        <header>
          <h2 className="text-2xl font-semibold">Company</h2>
          <p className="text-sm text-muted-foreground">Manage platform companies</p>
        </header>

        <Users />
      </motion.main>
    </section>
  );
}
