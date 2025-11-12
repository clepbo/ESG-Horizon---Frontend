"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";
import PaymentHistoryTable from "@/app/components/company/PaymentHistoryTable";
import { paymentHistory } from "@/lib/mockData/paymentHistory";

type Company = {
  company: string;
  industry?: string | null;
};

type Props = { company: Company };

export default function CompanySubscriptionTab({ company }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const filteredPayments = useMemo(() => {
    return paymentHistory.filter((payment) => {
      const matchesSearch =
        !debouncedSearchTerm.trim() ||
        payment.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || payment.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesDate = !dateFilter || payment.dateValue === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [debouncedSearchTerm, statusFilter, dateFilter]);

  return (
    <div className="space-y-6">
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Subscription Overview" iconSrc="/icons/SubscriptionBilling.svg">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <Info label="Current Plan" value="Premium" />
            <Info label="Status" value={<Badge status="Active" />} />
            <Info label="Start Date" value="2024-01-15" />
            <Info label="Next Billing" value="2024-09-15" />
            <Info label="Billing Cycle" value="Monthly" />
            <Info label="User Seats" value="18 / 25" />
          </div>
        </Card>

        <Card title="Company Billing Information" iconSrc="/icons/Company.svg">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <Info label="Company Name" value={company.company} />
            <Info label="Industry" value={company.industry} />
            <Info label="Company ID" value="ESG-2024-0042" />
            <Info label="Billing Contact" value="Sarah Johnson" />
            <Info label="Email" value="billing@greenenergy.com" />
            <Info label="Address" value="123 Green St, Eco City, EC 12345" />
          </div>
        </Card>
      </div>

      {/* Payment Summary */}
      <Card title="Upcoming Payment Summary" iconSrc="/icons/SubscriptionBilling.svg">
        <div className="grid grid-cols-3 gap-6 text-sm">
          <Info label="Next Invoice Date" value="2024-09-15" />
          <Info label="Amount Due" value="$299.99" />
          <Info label="Payment Method" value="Visa ••••1234" />
        </div>
      </Card>

      {/* Payment History */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Payment History</h2>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full">
            <Input
              id="search-input"
              placeholder="Search by Invoice ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-[var(--color-green-500)] hover:bg-[var(--color-green-600)] px-3 py-1.5 text-xs text-white cursor-pointer">
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>

        <PaymentHistoryTable data={filteredPayments} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value}</div>
    </div>
  );
}

function Card({
  title,
  iconSrc,
  children,
}: {
  title: string;
  iconSrc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Image src={iconSrc} alt={title} width={20} height={20} className="object-contain" />
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-teal-400 text-white border border-green-200">
      {status}
    </span>
  );
}
