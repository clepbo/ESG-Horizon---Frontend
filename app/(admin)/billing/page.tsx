"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";
import KpiCard from "../dashboard/_components/KpiCard";
import SubscriptionsTable from "./_components/SubscriptionsTable";
import BillingInfoModal from "./_components/BillingInfoModal";
import { billingKpis } from "./_fixtures/kpis";
import type { Subscription } from "./_fixtures/subscriptions";

export default function BillingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Subscription | null>(null);

  return (
    <>
      <AdminNavbar title="Subscription & Billing" subtitle="Manage plans, payments and invoices" />

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {billingKpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </section>

        <SubscriptionsTable
          onViewSubscription={(sub) => {
            setSelected(sub);
            setModalOpen(true);
          }}
        />
      </motion.div>

      <BillingInfoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        subscriptionId={selected?.id}
      />
    </>
  );
}
