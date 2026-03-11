"use client";

import { DataTable } from "@/app/components/ui/reusables/DataTable";
import { useAllTargets, useBaselineOptions } from "@/app/(company)/components/ranking/services";
import { useAuth } from "@/context/AuthContext";
import { Target, TargetType } from "@/app/(company)/components/types/target";
import { ColumnDef } from "@tanstack/react-table";
import { formatNumberFull } from "@/lib/numberFormat";

function getCurrentEmission(target: Target): number | null {
  if (target.generalTarget?.currentEmission != null) {
    return target.generalTarget.currentEmission;
  }
  return null;
}

const columns: ColumnDef<Target, any>[] = [
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => (
      <span className="text-sm font-mono text-gray-500">#{row.original.id}</span>
    ),
  },
  {
    header: "Date",
    accessorKey: "createdAt",
    meta: {
      toSearchString: (row: Target) => {
        const d = new Date(row.createdAt);
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      },
    },
    cell: ({ row }) => {
      const d = new Date(row.original.createdAt);
      return (
        <div>
          <p className="text-sm text-gray-700">
            {d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <p className="text-xs text-gray-600">
            {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
          </p>
        </div>
      );
    },
  },
  {
    header: "Type",
    accessorKey: "type",
    meta: {
      toSearchString: (row: Target) => {
        if (row.type === TargetType.GENERAL) return "general";
        if (row.type === TargetType.SCOPE) return "scope-based scope";
        return "general scope both";
      },
    },
    cell: ({ row }) => {
      const { type } = row.original;
      if (type === TargetType.GENERAL) {
        return (
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-teal-600/20">
            General
          </span>
        );
      }
      if (type === TargetType.SCOPE) {
        return (
          <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-600/20">
            Scope-based
          </span>
        );
      }
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20">
          General + Scope
        </span>
      );
    },
  },
  {
    header: "Baseline Emission",
    id: "baselineEmission",
    cell: ({ row }) => {
      const { type, generalTarget, scopeTargets } = row.original;

      if (type === TargetType.SCOPE && scopeTargets?.length) {
        const s1 = scopeTargets.find((s) => s.scope.toString() === "SCOPE1");
        const s2 = scopeTargets.find((s) => s.scope.toString() === "SCOPE2");
        const s3 = scopeTargets.find((s) => s.scope.toString() === "SCOPE3");
        const rows = [
          { label: "S1", value: s1?.baselineYearEmission },
          { label: "S2", value: s2?.baselineYearEmission },
          { label: "S3", value: s3?.baselineYearEmission },
        ].filter((r) => r.value != null);

        if (!rows.length) return <span className="text-sm text-gray-400">—</span>;

        const total = rows.reduce((sum, r) => sum + (r.value ?? 0), 0);

        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1 text-sm">
              <span className="font-semibold text-gray-800">{formatNumberFull(total)}</span>
              <span className="text-xs text-gray-600">tCO₂e</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {rows.map(({ label, value }) => `${label}: ${formatNumberFull(value!)}`).join(" / ")}
            </p>
          </div>
        );
      }

      const value = generalTarget?.baselineYearEmission;
      if (value == null) return <span className="text-sm text-gray-400">—</span>;
      return (
        <span className="text-sm text-gray-700">
          {formatNumberFull(value)}{" "}
          <span className="text-xs text-gray-600">tCO₂e</span>
        </span>
      );
    },
  },
  {
    header: "Current Emission",
    accessorKey: "currentEmission",
    meta: {
      toSearchString: (row: Target) => {
        if (row.type === TargetType.SCOPE && row.scopeTargets?.length) {
          const total = row.scopeTargets.reduce((sum, s) => sum + (s.currentEmission ?? 0), 0);
          const parts = row.scopeTargets
            .map((s) => (s.currentEmission != null ? String(s.currentEmission) : ""))
            .filter(Boolean)
            .join(" ");
          return `${total} ${parts}`;
        }
        const val = row.generalTarget?.currentEmission;
        return val != null ? String(val) : "";
      },
    },
    cell: ({ row }) => {
      const { type, scopeTargets } = row.original;

      if (type === TargetType.SCOPE && scopeTargets?.length) {
        const s1 = scopeTargets.find((s) => s.scope.toString() === "SCOPE1");
        const s2 = scopeTargets.find((s) => s.scope.toString() === "SCOPE2");
        const s3 = scopeTargets.find((s) => s.scope.toString() === "SCOPE3");
        const rows = [
          { label: "S1", value: s1?.currentEmission },
          { label: "S2", value: s2?.currentEmission },
          { label: "S3", value: s3?.currentEmission },
        ].filter((r) => r.value != null);

        if (!rows.length) return <span className="text-sm text-gray-400">—</span>;

        const total = rows.reduce((sum, r) => sum + (r.value ?? 0), 0);

        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1 text-sm">
              <span className="font-semibold text-gray-800">{formatNumberFull(total)}</span>
              <span className="text-xs text-gray-600">tCO₂e</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {rows.map(({ label, value }) => `${label}: ${formatNumberFull(value!)}`).join(" / ")}
            </p>
          </div>
        );
      }

      const value = getCurrentEmission(row.original);
      if (value == null) return <span className="text-sm text-gray-400">—</span>;
      return (
        <span className="text-sm text-gray-700">
          {formatNumberFull(value)}{" "}
          <span className="text-xs text-gray-600">tCO₂e</span>
        </span>
      );
    },
  },
  {
    header: "Target Year",
    accessorKey: "targetYear",
    cell: ({ row }) => {
      const { type, targetYear, generalTarget, scopeTargets } = row.original;

      if (type === TargetType.GENERAL && generalTarget?.reductionPercentage != null) {
        return (
          <div>
            <span className="text-sm text-gray-700">{targetYear}</span>
            <p className="text-xs font-bold text-amber-600">
              Goal: -{generalTarget.reductionPercentage}%
            </p>
          </div>
        );
      }

      if (type === TargetType.BOTH && generalTarget?.reductionPercentage != null) {
        const s1 = scopeTargets?.find((s) => s.scope.toString() === "SCOPE1");
        const s2 = scopeTargets?.find((s) => s.scope.toString() === "SCOPE2");
        const s3 = scopeTargets?.find((s) => s.scope.toString() === "SCOPE3");
        const scopeParts = [
          s1 ? `S1: -${s1.reductionPercentage}%` : null,
          s2 ? `S2: -${s2.reductionPercentage}%` : null,
          s3 ? `S3: -${s3.reductionPercentage}%` : null,
        ]
          .filter(Boolean)
          .join(" / ");
        return (
          <div>
            <span className="text-sm text-gray-700">{targetYear}</span>
            <p className="text-xs font-bold text-amber-600">
              Goal: -{generalTarget.reductionPercentage}%{scopeParts ? ` / ${scopeParts}` : ""}
            </p>
          </div>
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
          <div>
            <span className="text-sm text-gray-700">{targetYear}</span>
            {parts && (
              <p className="text-xs font-bold text-amber-600">{parts}</p>
            )}
          </div>
        );
      }

      return <span className="text-sm text-gray-700">{targetYear}</span>;
    },
  },
];

export default function TargetLogsTable() {
  const { user } = useAuth();
  const companyId = user?.company?.id;
  const { data, isLoading } = useAllTargets(companyId);
  const { data: baselineOptions } = useBaselineOptions(companyId);

  const sorted = [...(data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading || !sorted.length) return null;

  const latest = baselineOptions?.[0];
  const fmt = (v: string) =>
    new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between mb-3">
        <h6 className="font-semibold text-gray-900">Recent Targets</h6>
        {latest?.submittedAt || latest?.approvedAt ? (
          <p className="text-xs text-gray-500">
            Latest baseline ({latest.startYear})
            {latest.submittedAt && <> &middot; Submitted: {fmt(latest.submittedAt)}</>}
            {latest.approvedAt && <> &middot; <span className="text-green-600">Approved: {fmt(latest.approvedAt)}</span></>}
          </p>
        ) : null}
      </div>
      <DataTable
        data={sorted}
        columns={columns}
        searchPlaceholder="Search targets..."
      />
    </div>
  );
}
