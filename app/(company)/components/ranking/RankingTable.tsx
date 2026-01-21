"use client";

import React from "react";

export default function RankingTable() {
  return (
    <div className="bg-gray-50 p-6 rounded-md">
      <div className="bg-white p-12 rounded-md shadow-sm">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Coming Soon</h2>

          <p className="text-gray-500 max-w-md">
            ESG Performance Rankings and leaderboards will be available soon. Stay tuned for
            insights into how your organization compares with industry peers.
          </p>
        </div>
      </div>
    </div>
  );
}
// "use client";

// import React, { useMemo } from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import { DataTable, FilterOption } from "@/app/components/ui/reusables/DataTable";
// import { CustomButton } from "@/app/components/ui/reusables/CustomButton";

// interface Company {
//   rank: string;
//   company: string;
//   industry: string;
//   sector: string;
//   region: string;
//   reductionTarget: string;
//   esgScore: string;
//   isYou?: boolean;
// }

// export default function RankingTable() {
//   const data: Company[] = [
//     {
//       rank: "#1",
//       company: "GreenTech Solutions",
//       industry: "E-Commerce",
//       sector: "Consumer goods",
//       region: "Nigeria",
//       reductionTarget: "65%",
//       esgScore: "92/100",
//     },
//     {
//       rank: "#2",
//       company: "EcoSoft Inc",
//       industry: "Oil & Gas",
//       sector: "Extractives & Minerals Processing",
//       region: "South Africa",
//       reductionTarget: "58%",
//       esgScore: "79/100",
//     },
//     {
//       rank: "#3",
//       company: "CleanCode Corp",
//       industry: "Airlines",
//       sector: "Transportation",
//       region: "Ghana",
//       reductionTarget: "52%",
//       esgScore: "74/100",
//     },
//     {
//       rank: "#4",
//       company: "ClearWatts Energy",
//       industry: "Oil & Gas",
//       sector: "Extractives & Minerals Processing",
//       region: "Benin",
//       reductionTarget: "48%",
//       esgScore: "70/100",
//       isYou: true,
//     },
//     {
//       rank: "#5",
//       company: "DataGreen Ltd.",
//       industry: "Insurance",
//       sector: "Financials",
//       region: "Togo",
//       reductionTarget: "45%",
//       esgScore: "65/100",
//     },
//   ];

//   const columns = useMemo<ColumnDef<Company>[]>(
//     () => [
//       {
//         header: "Rank",
//         accessorKey: "rank",
//       },
//       {
//         header: "Company",
//         accessorKey: "company",
//         cell: ({ row }) => (
//           <div className="flex items-center gap-2">
//             <span>{row.original.company}</span>
//             {row.original.isYou && (
//               <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
//                 You
//               </span>
//             )}
//           </div>
//         ),
//       },
//       {
//         header: "Industry",
//         accessorKey: "industry",
//       },
//       {
//         header: "Sector",
//         accessorKey: "sector",
//       },
//       {
//         header: "Region",
//         accessorKey: "region",
//       },
//       {
//         header: "Reduction Target",
//         accessorKey: "reductionTarget",
//       },
//       {
//         header: "ESG Score",
//         accessorKey: "esgScore",
//         cell: ({ getValue }) => {
//           const valueStr = getValue() as string;
//           const value = Number(valueStr.split("/")[0]);
//           const color =
//             value >= 80
//               ? "bg-green-100 text-green-600"
//               : value >= 70
//                 ? "bg-blue-100 text-blue-600"
//                 : "bg-yellow-100 text-yellow-600";
//           return (
//             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
//               {valueStr}
//             </span>
//           );
//         },
//       },
//     ],
//     []
//   );

//   const filterOptions: FilterOption[] = [
//     {
//       label: "Industries",
//       columnId: "industry",
//       options: ["E-Commerce", "Oil & Gas", "Airlines", "Insurance"],
//     },
//     {
//       label: "Sectors",
//       columnId: "sector",
//       options: [
//         "Consumer goods",
//         "Extractives & Minerals Processing",
//         "Transportation",
//         "Financials",
//       ],
//     },
//     {
//       label: "Regions",
//       columnId: "region",
//       options: ["Nigeria", "South Africa", "Ghana", "Benin", "Togo"],
//     },
//   ];

//   return (
//     <div className="bg-gray-50 p-6 rounded-md space-y-6">
//       {/* Filter Leaderboards Section */}
//       <div className="bg-white p-4 rounded-md shadow-sm space-y-4">
//         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//           <h2 className="text-gray-800 font-semibold text-lg">Filter Leader boards</h2>
//           <CustomButton variant="filled" className="">
//             Reset Filters
//           </CustomButton>
//         </div>

//         <div className="bg-white p-6 rounded-md shadow-sm text-center">
//           <h3 className="text-lg font-semibold text-gray-800">ESG Performance Rankings</h3>
//           <div className="text-4xl font-bold text-primary my-2">
//             4/<span className="text-sm text-black">490</span>
//           </div>
//           <p className="text-gray-500 text-sm mb-6">
//             Your organization’s rank based on your filter
//           </p>
//         </div>
//         <div className="bg-white rounded-md shadow-sm text-center">
//           <DataTable data={data} columns={columns} filterOptions={filterOptions} />
//         </div>
//       </div>

//       {/* ESG Rankings Summary */}
//     </div>
//   );
// }
