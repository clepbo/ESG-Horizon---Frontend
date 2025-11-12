"use client";

import { Download, Eye } from "lucide-react";
interface PaymentItem {
  date: string;
  dateValue: string;
  id: string;
  amount: string;
  method: string;
  plan: string;
  status: string;
}

interface Props {
  data: PaymentItem[];
}

export default function PaymentHistoryTable({ data }: Props) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-600 text-white border ";
      case "Pending":
        return "bg-yellow-500 text-white border";
      case "Declined":
        return "bg-red-500 text-white border border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-600">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Invoice ID</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Payment Method</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Quick Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-3">{item.date}</td>
              <td className="px-4 py-3">{item.id}</td>
              <td className="px-4 py-3">{item.amount}</td>
              <td className="px-4 py-3">{item.method}</td>
              <td className="px-4 py-3">{item.plan}</td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusStyle(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3 flex gap-2 items-center">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
