"use client";

import { Eye, Download } from "lucide-react";
import React from "react";

interface ActivityItem {
  date: string;
  activity: string;
  performedBy: string;
  role: string;
  details: string;
  status: string;
}

interface ActivityTableProps {
  activities: ActivityItem[];
  getStatusBadge: (status: string) => React.ReactNode;
}

export default function CompanyActivitiesTable({ activities, getStatusBadge }: ActivityTableProps) {
  return (
    <table className="w-full text-sm overflow-x-auto">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left">Date</th>
          <th className="px-4 py-3 text-left">Activity</th>
          <th className="px-4 py-3 text-left">Performed By</th>
          <th className="px-4 py-3 text-left">Role</th>
          <th className="px-4 py-3 text-left">Details</th>
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-left">Quick Actions</th>
        </tr>
      </thead>
      <tbody>
        {activities.length > 0 ? (
          activities.map((item, idx) => (
            <tr key={idx} className="border-t border-t-gray-300">
              <td className="px-4 py-3">{item.date}</td>
              <td className="px-4 py-3">{item.activity}</td>
              <td className="px-4 py-3">{item.performedBy}</td>
              <td className="px-4 py-3">{item.role}</td>
              <td className="px-4 py-3">{item.details}</td>
              <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
              <td className="px-4 py-3 flex items-center gap-2">
                <button
                  className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                  title="View"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7} className="text-center py-6 text-gray-500">
              No activities found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
