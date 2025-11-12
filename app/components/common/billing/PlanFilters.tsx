"use client";

export default function PlanFilters() {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <div className="flex gap-2">
        <select className="border border-gray-300 rounded px-3 py-1 text-sm">
          <option value="">All Plans</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select className="border border-gray-300 rounded px-3 py-1 text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
      </div>
    </div>
  );
}
