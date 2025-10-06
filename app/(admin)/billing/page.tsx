"use client";

import Header from "@/app/components/layout/Header";
import { BillingTabs } from "@/app/components/common/billing/BillingTabs";
import SubscriptionLineChart from "@/app/components/common/billing/SubscriptionLineChart";
import BillingActivityFeed from "@/app/components/common/billing/BillingActivityFeed";
import { motion } from "framer-motion";
import GenerateInvoiceButton from "@/app/components/common/billing/GenerateInvoiceButton";
import BillingTable from "@/app/components/common/billing/BillingTable";
import ExportAllButton from "@/app/components/common/billing/ExportBillingButton";
import BillingSummaryCard from "@/app/components/common/billing/BillingSummaryCard";

export default function SubscriptionBillingPage() {
  return (
    <section className="min-h-screen flex flex-col">
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
        {/* Header */}
        <Header />

        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Subscription & Billing
            </h1>
            <p className="text-sm text-gray-500">
              Manage subscriptions and billing for all companies
            </p>
          </div>
          <div className="flex gap-2">
            <ExportAllButton />
            <GenerateInvoiceButton />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <BillingSummaryCard
            label="Monthly Revenue"
            value="₦150,000"
            iconSrc="/icons/investor.svg"
            iconBgColor="bg-green-200"
          />
          <BillingSummaryCard
            label="Active Subscriptions"
            value={7}
            iconSrc="/icons/Users.svg"
            iconBgColor="bg-blue-100"
          />
          <BillingSummaryCard
            label="Pending Payments"
            value={3}
            iconSrc="/icons/Error.svg"
            iconBgColor="bg-gray-100"
          />
          <BillingSummaryCard
            label="Growth Rate"
            value="+12%"
            iconSrc="/icons/Analytics.svg"
            iconBgColor="bg-yellow-100"
          />
        </div>

        {/* Analytics & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SubscriptionLineChart />
          <BillingActivityFeed />
        </div>

        {/* Activity Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Activities
          </h2>
          <BillingTabs />
          <BillingTable />
        </div>
      </motion.main>
    </section>
  );
}
