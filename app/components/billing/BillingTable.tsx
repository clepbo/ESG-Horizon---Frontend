"use client";

const mockData = [
  {
    company: "Company A",
    plan: "Pro",
    status: "Active",
    amount: "₦50,000",
    dueDate: "Aug 10, 2025",
  },
  {
    company: "Company B",
    plan: "Basic",
    status: "Pending",
    amount: "₦20,000",
    dueDate: "Aug 12, 2025",
  },
];

export default function BillingTable() {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 font-medium">Company</th>
            <th className="p-3 font-medium">Plan</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Amount</th>
            <th className="p-3 font-medium">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((row, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">{row.company}</td>
              <td className="p-3">{row.plan}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    row.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td className="p-3">{row.amount}</td>
              <td className="p-3">{row.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
