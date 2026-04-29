"use client";

import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";
import ProfileSection from "./_components/ProfileSection";
import NotificationsSection from "./_components/NotificationsSection";
import SecuritySection from "./_components/SecuritySection";
import DataManagementSection from "./_components/DataManagementSection";

export default function SettingsPage() {
  return (
    <>
      <AdminNavbar title="Settings" subtitle="Account, company and platform preferences" />

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <ProfileSection />
          <NotificationsSection />
          <SecuritySection />
          <DataManagementSection />
        </div>
      </motion.div>
    </>
  );
}
