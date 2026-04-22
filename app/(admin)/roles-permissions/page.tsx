"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";
import RolesTab from "./_components/RolesTab";
import PermissionMatrixTab from "./_components/PermissionMatrixTab";
import PermissionGroupsTab from "./_components/PermissionGroupsTab";
import CreateRoleModal from "./_components/CreateRoleModal";
import CreatePermissionModal from "./_components/CreatePermissionModal";

const TABS = ["Roles", "Permission Matrix", "Permission Groups"] as const;
type Tab = (typeof TABS)[number];

type ModalMode = "create" | "edit";

export default function RolesPermissionsPage() {
  const [tab, setTab] = useState<Tab>("Roles");
  const [roleModal, setRoleModal] = useState<{ open: boolean; mode: ModalMode }>({
    open: false,
    mode: "create",
  });
  const [permissionModal, setPermissionModal] = useState<{ open: boolean; mode: ModalMode }>({
    open: false,
    mode: "create",
  });

  const openCreateRole = () => setRoleModal({ open: true, mode: "create" });
  const openEditRole = () => setRoleModal({ open: true, mode: "edit" });
  const closeRoleModal = () => setRoleModal((s) => ({ ...s, open: false }));

  const openCreatePermission = () => setPermissionModal({ open: true, mode: "create" });
  const openEditPermission = () => setPermissionModal({ open: true, mode: "edit" });
  const closePermissionModal = () => setPermissionModal((s) => ({ ...s, open: false }));

  return (
    <>
      <AdminNavbar
        title="Roles & Permissions"
        subtitle="Manage role definitions and permission matrices"
      />

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <section className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Roles & Permissions</h2>
            <p className="text-sm text-gray-700 mt-0.5">
              Define roles and manage platform-wide access permissions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openCreatePermission}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              Create Permission
            </button>
            <button
              type="button"
              onClick={openCreateRole}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          </div>
        </section>

        <nav className="border-b border-gray-200">
          <ul className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const active = t === tab;
              return (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => setTab(t)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                      active
                        ? "text-[#119B95] border-[#119B95]"
                        : "text-gray-700 border-transparent hover:text-gray-900"
                    }`}
                  >
                    {t}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {tab === "Roles" && (
          <RolesTab onCreateRole={openCreateRole} onEditRole={openEditRole} />
        )}
        {tab === "Permission Matrix" && <PermissionMatrixTab />}
        {tab === "Permission Groups" && (
          <PermissionGroupsTab onEditGroup={openEditPermission} />
        )}
      </motion.div>

      <CreateRoleModal
        open={roleModal.open}
        mode={roleModal.mode}
        onClose={closeRoleModal}
        onSaveDraft={(payload) => console.log("Save draft role:", payload)}
        onActivate={(payload) => console.log("Activate role:", payload)}
      />

      <CreatePermissionModal
        open={permissionModal.open}
        mode={permissionModal.mode}
        onClose={closePermissionModal}
        onSubmit={(payload) => console.log("Save permission:", payload)}
      />
    </>
  );
}
