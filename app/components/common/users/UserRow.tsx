"use client";

type Props = {
  name: string;
  company: string;
  category: string;
  role: string;
  status: "Approved" | "Pending" | "Suspended" | "Under Review";
};

const statusColors = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Suspended: "bg-red-100 text-red-700",
  "Under Review": "bg-blue-100 text-blue-700",
};

export function UserRow({ name, company, category, role, status }: Props) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="p-3">{name}</td>
      <td className="p-3">{company}</td>
      <td className="p-3">{category}</td>
      <td className="p-3">{role}</td>
      <td className="p-3">
        <span className={`text-xs px-2 py-1 rounded ${statusColors[status]}`}>{status}</span>
      </td>
      <td className="p-3">
        <button className="text-white bg-emerald-600 px-3 py-1 rounded text-xs hover:bg-emerald-700">
          View/Edit
        </button>
      </td>
    </tr>
  );
}
