"use client";

import Header from "@/app/components/layout/Header";
import { ReportSummaryCard } from "@/app/components/reports/ReportSummaryCard";
import SubscriptionLineChart from "@/app/components/billing/SubscriptionLineChart";
import BillingActivityFeed from "@/app/components/billing/BillingActivityFeed";
import PlanFilters from "@/app/components/billing/PlanFilters";

import ExportBillingButton from "@/app/components/billing/ExportBillingButton";
import GenerateInvoiceButton from "@/app/components/billing/GenerateInvoiceButton";
import { BadgePercent, Building2, FileWarning, Users } from "lucide-react";
import BillingTable from "@/app/components/billing/BillingTable";

export default function SubscriptionBillingPage() {
  return (
    <section className="min-h-screen flex flex-col">
      <main className="flex-1 p-4 space-y-6">
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
            {/* <ExportBillingButton /> */}
            <GenerateInvoiceButton />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportSummaryCard
            label="Monthly Revenue"
            value="₦150,000"
            icon={<BadgePercent className="w-5 h-5" />}
            iconBgColor="bg-green-100"
            change={5}
          />
          <ReportSummaryCard
            label="Active Subscriptions"
            value={7}
            icon={<Users className="w-5 h-5" />}
            iconBgColor="bg-blue-100"
            change={2}
          />
          <ReportSummaryCard
            label="Pending Payments"
            value={3}
            icon={<FileWarning className="w-5 h-5" />}
            iconBgColor="bg-gray-100"
            change={0}
          />
          <ReportSummaryCard
            label="Growth Rate"
            value="+12%"
            icon={<Building2 className="w-5 h-5" />}
            iconBgColor="bg-yellow-100"
            change={12}
          />
        </div>

        {/* Analytics & Recent Activities */}
        {/* Analytics & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col h-full">
            <SubscriptionLineChart />
          </div>
          <div className="flex flex-col h-full">
            <BillingActivityFeed />
          </div>
        </div>

        {/* Billing Table */}
        <BillingTable />
      </main>
    </section>
  );
}
