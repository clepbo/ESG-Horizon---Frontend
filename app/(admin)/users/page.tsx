"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import KpiCard from "../dashboard/_components/KpiCard";
import UsersTable from "./_components/UsersTable";
import InviteUserModal from "./_components/InviteUserModal";
import UserDetailsModal from "./_components/UserDetailsModal";
import { userKpis } from "./_fixtures/kpis";
import type { UserRow } from "./_fixtures/users";

export default function UserManagementPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);

  return (
    <>
      <AdminNavbar
        title="User Management"
        subtitle="Manage all company admins, roles and permissions"
      />

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <section className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-700 mt-0.5">
              Manage all platform users, roles and permissions
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Invite User
          </button>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {userKpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </section>

        <UsersTable
          onViewUser={(u) => {
            setSelected(u);
            setDetailsOpen(true);
          }}
          onSuspendUser={(u) => setSelected(u)}
        />
      </motion.div>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={(payload) => {
          // TODO: wire to real invite mutation
          console.log("Invite:", payload);
        }}
      />

      <UserDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        userId={selected?.id}
        onSave={(payload) => {
          // TODO: wire to real update mutation
          console.log("Update user:", payload);
        }}
        onSuspend={() => {
          // TODO: wire to real suspend mutation
          setDetailsOpen(false);
        }}
      />
    </>
  );
}
