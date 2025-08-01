// "use client";

// import { useState, useMemo } from "react";
// import { Eye, Pencil } from "lucide-react";
// import { useRouter } from "next/navigation";

// import { reportData } from "@/mockData/reportData";
// import Pagination from "@/app/components/Pagination";
// import SearchInput from "@/app/components/ui/SearchInput";
// import SelectFilter from "@/app/components/ui/SearchFilter";
// import Spinner from "@/app/components/ui/Spinner";

// const statusStyles: Record<string, string> = {
//   Published: "bg-green-500 text-white",
//   Rejected: "bg-red-500 text-white",
//   "Under Review": "bg-yellow-400 text-white",
//   Approved: "bg-blue-500 text-white",
//   Draft: "bg-gray-400 text-white",
// };

// const StatusBadge = ({ status }: { status: string }) => {
//   const style = statusStyles[status] || "bg-gray-200 text-gray-700";
//   return (
//     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
//       {status}
//     </span>
//   );
// };

// export default function ReportTable() {
//   const router = useRouter();

//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("All Types");
//   const [statusFilter, setStatusFilter] = useState("All Status");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [loading, setLoading] = useState(false);

//   const filteredReports = useMemo(() => {
//     return reportData.filter((report) => {
//       const matchesSearch = report.title
//         .toLowerCase()
//         .includes(search.toLowerCase());
//       const matchesType =
//         typeFilter === "All Types" || report.type === typeFilter;
//       const matchesStatus =
//         statusFilter === "All Status" || report.status === statusFilter;
//       return matchesSearch && matchesType && matchesStatus;
//     });
//   }, [search, typeFilter, statusFilter]);

//   const paginatedReports = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredReports.slice(start, start + itemsPerPage);
//   }, [filteredReports, currentPage, itemsPerPage]);

//   const totalItems = filteredReports.length;

//   return (
//     <div className="space-y-4">
//       {/* Top Filter Buttons */}
//       <div className="flex flex-col lg:flex-row w-full bg-green-50 rounded-lg  gap-2">
//         {["All Reports", "Published", "Approved", "Under Review", "Drafts"].map(
//           (label) => {
//             const isActive =
//               statusFilter === label ||
//               (label === "All Reports" && statusFilter === "All Status");

//             return (
//               <button
//                 key={label}
//                 className={`flex-1 px-4 py-2 rounded-md border transition-colors duration-200 text-sm font-medium
//             ${
//               isActive
//                 ? "bg-green-600 text-white border-green-600"
//                 : "bg-white text-gray-800 border-green-600 hover:bg-green-50"
//             }`}
//                 onClick={() =>
//                   setStatusFilter(
//                     label === "All Reports" ? "All Status" : label
//                   )
//                 }
//               >
//                 {label}
//               </button>
//             );
//           }
//         )}
//       </div>

//       {/* Search and Filters */}
//       <div className="flex flex-col md:flex-row justify-between gap-4">
//         <SearchInput
//           value={search}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setSearch(e.target.value)
//           }
//         />
//         <div className="flex gap-2">
//           <SelectFilter
//             value={typeFilter}
//             onChange={(val: string) => {
//               setTypeFilter(val);
//               setCurrentPage(1);
//             }}
//             options={[
//               "All Types",
//               "Quarterly",
//               "Annual",
//               "Bi-Annual",
//               "Sustainability",
//               "Compliance",
//             ]}
//           />
//           <SelectFilter
//             value={statusFilter}
//             onChange={(val: string) => {
//               setStatusFilter(val);
//               setCurrentPage(1);
//             }}
//             options={[
//               "All Status",
//               "Published",
//               "Approved",
//               "Under Review",
//               "Rejected",
//               "Draft",
//             ]}
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="relative overflow-x-auto bg-white shadow rounded-xl">
//         {loading && (
//           <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
//             <Spinner />
//           </div>
//         )}
//         <table className="min-w-full text-sm text-left">
//           <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
//             <tr>
//               <th className="px-4 py-3">Report Title</th>
//               <th className="px-4 py-3">Type</th>
//               <th className="px-4 py-3">Submission Date</th>
//               <th className="px-4 py-3">Status</th>
//               <th className="px-4 py-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {paginatedReports.map((report) => (
//               <tr key={report.id} className="hover:bg-gray-50">
//                 <td className="px-4 py-3">{report.title}</td>
//                 <td className="px-4 py-3">{report.type}</td>
//                 <td className="px-4 py-3">{report.submissionDate}</td>
//                 <td className="px-4 py-3">
//                   <StatusBadge status={report.status} />
//                 </td>
//                 <td className="px-4 py-3">
//                   <div className="inline-flex gap-2">
//                     <button
//                       // onClick={() => router.push(`/reports/${report.id}`)}
//                       className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
//                     >
//                       <Eye className="w-4 h-4 text-gray-600" />
//                     </button>
//                     <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100">
//                       <Pencil className="w-4 h-4 text-gray-600" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between px-2 pt-2">
//         <div className="flex items-center gap-2 text-sm">
//           <span>Rows per page</span>
//           <select
//             value={itemsPerPage}
//             onChange={(e) => {
//               setItemsPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             className="border rounded px-2 py-1 text-sm"
//           >
//             {[10, 25, 50].map((num) => (
//               <option key={num} value={num}>
//                 {num}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="mt-4 px-4 pb-4">
//           <Pagination
//             totalItems={totalItems}
//             itemsPerPage={itemsPerPage}
//             currentPage={currentPage}
//             onPageChange={setCurrentPage}
//             onItemsPerPageChange={setItemsPerPage}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useMemo } from "react";
import { Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { reportData } from "@/mockData/reportData";
import Pagination from "@/app/components/Pagination";
import SearchInput from "@/app/components/ui/SearchInput";
import SelectFilter from "@/app/components/ui/SearchFilter";
import Spinner from "@/app/components/ui/Spinner";

const statusStyles: Record<string, string> = {
  Published: "bg-green-500 text-white",
  Rejected: "bg-red-500 text-white",
  "Under Review": "bg-yellow-400 text-white",
  Approved: "bg-blue-500 text-white",
  Draft: "bg-gray-400 text-white",
};

const StatusBadge = ({ status }: { status: string }) => {
  const style = statusStyles[status] || "bg-gray-200 text-gray-700";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};

export default function ReportTable() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const filteredReports = useMemo(() => {
    return reportData.filter((report) => {
      const matchesSearch = report.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType =
        typeFilter === "All Types" || report.type === typeFilter;
      const matchesStatus =
        statusFilter === "All Status" || report.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  const totalItems = filteredReports.length;

  const handlePageChange = (page: number) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 400);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Buttons */}
      <div className="flex flex-col lg:flex-row w-full bg-green-50 rounded-lg gap-2">
        {["All Reports", "Published", "Approved", "Under Review", "Drafts"].map(
          (label) => {
            const isActive =
              statusFilter === label ||
              (label === "All Reports" && statusFilter === "All Status");

            return (
              <button
                key={label}
                className={`flex-1 px-4 py-2 rounded-md border transition-colors duration-200 text-sm font-medium
            ${
              isActive
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-800 border-green-600 hover:bg-green-50"
            }`}
                onClick={() =>
                  setStatusFilter(
                    label === "All Reports" ? "All Status" : label
                  )
                }
              >
                {label}
              </button>
            );
          }
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />
        <div className="flex gap-2">
          <SelectFilter
            value={typeFilter}
            onChange={(val: string) => {
              setTypeFilter(val);
              setCurrentPage(1);
            }}
            options={[
              "All Types",
              "Quarterly",
              "Annual",
              "Bi-Annual",
              "Sustainability",
              "Compliance",
            ]}
          />
          <SelectFilter
            value={statusFilter}
            onChange={(val: string) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            options={[
              "All Status",
              "Published",
              "Approved",
              "Under Review",
              "Rejected",
              "Draft",
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto bg-white shadow rounded-xl">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <Spinner />
          </div>
        )}
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3">Report Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Submission Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{report.title}</td>
                <td className="px-4 py-3">{report.type}</td>
                <td className="px-4 py-3">{report.submissionDate}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100">
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 px-4 pb-4">
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}
