"use client";

import { useEffect } from "react";
import { Building2, X } from "lucide-react";
import { companyDetailsFixture } from "../_fixtures/companyDetails";
import PlanPill from "../../billing/_components/PlanPill";
import CategoryPill from "./CategoryPill";
import CompanyStatusPill from "./CompanyStatusPill";

interface CompanyDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSuspend?: () => void;
  // Left for real-data wiring later; fixture ignores it.
  companyId?: string;
}

export default function CompanyDetailsModal({ open, onClose, onSuspend }: CompanyDetailsModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const c = companyDetailsFixture;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mt-20 mb-6 bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Company Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">{c.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <CategoryPill category={c.category} />
                <CompanyStatusPill status={c.status} />
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 text-sm">
            <Field label="Email Address" value={c.email} />
            <Field label="Industry Type" value={c.industry} />
            <Field label="Website Address" value={c.website} />
            <Field label="Contact Phone Number" value={c.contactPhone} />
            <Field label="Staff Strength" value={String(c.staffStrength)} />
            <Field label="Company Registration Number" value={c.registrationNumber} />
            <div>
              <dt className="text-xs text-gray-700 mb-1">ESG Score</dt>
              <dd>
                {c.esgScore != null ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-[#119B95]">
                    {c.esgScore}%
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    N/A
                  </span>
                )}
              </dd>
            </div>
            <Field label="Company Address" value={c.address} />
            <div>
              <dt className="text-xs text-gray-700 mb-1">Subscription</dt>
              <dd>
                <PlanPill plan={c.subscription} />
              </dd>
            </div>
            <Field label="Company Name" value={c.name} />
          </dl>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onSuspend}
            className="h-10 px-5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Suspend Company
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-700 mb-1">{label}</dt>
      <dd className="text-gray-900 font-medium break-words">{value}</dd>
    </div>
  );
}
