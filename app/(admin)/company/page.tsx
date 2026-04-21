"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";
import KpiCard from "../dashboard/_components/KpiCard";
import CompaniesTable from "./_components/CompaniesTable";
import CompanyDetailsModal from "./_components/CompanyDetailsModal";
import { companyKpis } from "./_fixtures/kpis";
import type { CompanyRow } from "./_fixtures/companies";

export default function CompanyManagementPage() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<CompanyRow | null>(null);

  return (
    <>
      <AdminNavbar
        title="Company Management"
        subtitle="Manage organisations and their access on the platform"
      />

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {companyKpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </section>

        <CompaniesTable
          onViewCompany={(c) => {
            setSelected(c);
            setDetailsOpen(true);
          }}
          onSuspendCompany={(c) => {
            // TODO: wire suspend mutation once backend ready
            setSelected(c);
          }}
        />
      </motion.div>

      <CompanyDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        companyId={selected?.id}
        onSuspend={() => {
          // TODO: real mutation; for now close the modal
          setDetailsOpen(false);
        }}
      />
    </>
  );
}
