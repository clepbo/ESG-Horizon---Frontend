"use client";

import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";
import KpiCard from "../dashboard/_components/KpiCard";
import AuditTrailTable from "./_components/AuditTrailTable";
import { auditKpis } from "./_fixtures/kpis";

export default function AuditTrailPage() {
  return (
    <>
      <AdminNavbar title="Audit Trail" subtitle="Full platform event log with actor tracking" />

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {auditKpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </section>

        <AuditTrailTable />
      </motion.div>
    </>
  );
}
