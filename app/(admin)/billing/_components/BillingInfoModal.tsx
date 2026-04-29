"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { billingInfoFixture } from "../_fixtures/billingInfo";
import PlanPill from "./PlanPill";
import StatusPill from "./StatusPill";

interface BillingInfoModalProps {
  open: boolean;
  onClose: () => void;
  // subscriptionId left for future real lookup; fixture ignores it for now.
  subscriptionId?: string;
}

function formatAmount(amount: number) {
  if (amount === 0) return "₦0";
  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 16);
  return `${date} ${time}`;
}

export default function BillingInfoModal({ open, onClose }: BillingInfoModalProps) {
  const [autoRenewal, setAutoRenewal] = useState(billingInfoFixture.autoRenewal);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const info = billingInfoFixture;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6">
      <div className="relative w-full max-w-5xl mt-20 mb-6 bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <section className="rounded-lg border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Subscription Overview</h3>
            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <dt className="text-xs text-gray-700 mb-1">Current Plan</dt>
                <dd>
                  <PlanPill plan={info.currentPlan} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-700 mb-1">Status</dt>
                <dd>
                  <StatusPill status={info.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-700 mb-1">Last Payment</dt>
                <dd className="text-gray-900 font-medium">{info.lastPayment ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-700 mb-1">Next Payment</dt>
                <dd className="text-gray-900 font-medium">{info.nextPayment ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-700 mb-1">Billing Cycle</dt>
                <dd className="text-gray-900 font-medium">{info.billingCycle}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-700 mb-1">Amount</dt>
                <dd className="text-gray-900 font-medium">{formatAmount(info.amount)}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-lg border border-gray-100 p-4 flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Auto-renewal</p>
                <p className="text-xs text-gray-700 mt-0.5">
                  Automatically renew subscription each billing cycle
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoRenewal}
                onClick={() => setAutoRenewal((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                  autoRenewal ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    autoRenewal ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              className="mt-4 w-full h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
            >
              Cancel Subscription
            </button>
          </section>

          <section className="rounded-lg border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Company Billing Information
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs text-gray-700 mb-1">Company Name</dt>
                <dd className="text-gray-900 font-medium">{info.company.name}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-700 mb-1">Industry</dt>
                  <dd className="text-gray-900 font-medium">{info.company.industry}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-700 mb-1">Company ID</dt>
                  <dd className="text-gray-900 font-medium">{info.company.companyId}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs text-gray-700 mb-1">Billing Contact</dt>
                <dd className="text-gray-900 font-medium">{info.company.billingContact.name}</dd>
                <dd className="text-gray-800">{info.company.billingContact.email}</dd>
                <dd className="text-gray-800">{info.company.billingContact.address}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase bg-gray-50">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Invoice ID</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Next Payment</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                  {info.invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-gray-100">
                      <td className="px-5 py-3 text-gray-900">{formatDateTime(inv.date)}</td>
                      <td className="px-5 py-3">{inv.id}</td>
                      <td className="px-5 py-3">{formatAmount(inv.amount)}</td>
                      <td className="px-5 py-3">{inv.nextPayment ?? "-"}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={inv.status} />
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          className="p-1.5 rounded-md border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          aria-label="Download invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
