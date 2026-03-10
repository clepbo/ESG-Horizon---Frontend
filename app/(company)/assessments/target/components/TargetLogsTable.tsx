"use client";

import { DataTable } from "@/app/components/ui/reusables/DataTable";
import { useAllTargets } from "@/app/(company)/components/ranking/services";
import { useAuth } from "@/context/AuthContext";
import { Target, TargetType } from "@/app/(company)/components/types/target";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<Target, any>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-gray-900 text-sm">{row.original.name}</p>
        {row.original.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) =>
      row.original.type === TargetType.GENERAL ? (
        <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-teal-600/20">
          General
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-600/20">
          Scope-based
        </span>
      ),
  },
  {
    header: "Baseline Year",
    accessorKey: "baselineYear",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.original.baselineYear}</span>
    ),
  },
  {
    header: "Target Year",
    accessorKey: "targetYear",
    cell: ({ row }) => {
      const { type, targetYear, generalTarget, scopeTargets } = row.original;

      if (type === TargetType.GENERAL && generalTarget?.reductionPercentage != null) {
        return (
          <span className="text-sm text-gray-700">
            {targetYear}{" "}
            <span className="font-medium text-amber-500">
              (Goal: -{generalTarget.reductionPercentage}%)
            </span>
          </span>
        );
      }

      if (type === TargetType.SCOPE && scopeTargets?.length) {
        const s1 = scopeTargets.find((s) => s.scope.toString() === "SCOPE1");
        const s2 = scopeTargets.find((s) => s.scope.toString() === "SCOPE2");
        const s3 = scopeTargets.find((s) => s.scope.toString() === "SCOPE3");
        const parts = [
          s1 ? `S1: -${s1.reductionPercentage}%` : null,
          s2 ? `S2: -${s2.reductionPercentage}%` : null,
          s3 ? `S3: -${s3.reductionPercentage}%` : null,
        ]
          .filter(Boolean)
          .join(" / ");

        return (
          <span className="text-sm text-gray-700">
            {targetYear}{" "}
            {parts && <span className="font-medium text-amber-500">({parts})</span>}
          </span>
        );
      }

      return <span className="text-sm text-gray-700">{targetYear}</span>;
    },
  },
  {
    header: "Date Set",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const d = new Date(row.original.createdAt);
      return (
        <div>
          <p className="text-sm text-gray-700">
            {d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <p className="text-xs text-gray-400">
            Time: {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
          </p>
        </div>
      );
    },
  },
];

export default function TargetLogsTable() {
  const { user } = useAuth();
  const companyId = user?.company?.id;
  const { data, isLoading } = useAllTargets(companyId);

  const sorted = [...(data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading || !sorted.length) return null;

  return (
    <div className="mt-4">
      <h6 className="font-semibold text-gray-900 mb-3">Target Logs</h6>
      <DataTable
        data={sorted}
        columns={columns}
        searchPlaceholder="Search targets..."
      />
    </div>
  );
}
