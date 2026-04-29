"use client";

import React from "react";
import { FileText } from "lucide-react";
import type { ReportEvidence } from "@/types/report/reportResponse";

interface EvidenceAppendixProps {
  evidence?: ReportEvidence;
}

const pillars = [
  { key: "environmental" as const, label: "Environmental" },
  { key: "socialCapital" as const, label: "Social Capital" },
  { key: "humanCapital" as const, label: "Human Capital" },
  { key: "businessModel" as const, label: "Business Model & Innovation" },
  { key: "leadershipAndGovernance" as const, label: "Leadership & Governance" },
];

export default function EvidenceAppendix({ evidence }: EvidenceAppendixProps) {
  if (!evidence) return null;

  const hasAny = pillars.some((p) => (evidence[p.key]?.length ?? 0) > 0);
  if (!hasAny) return null;

  return (
    <div className="bg-white px-6 py-8">
      {/* Title */}
      <div className="mb-6 border-b-2 border-gray-800 pb-3">
        <h2 className="text-2xl font-bold text-gray-900">Appendix: Supporting Evidence</h2>
        <p className="mt-1 text-sm text-gray-500">
          Documents and evidence uploaded during the assessment process
        </p>
      </div>

      {/* Pillar sections */}
      {pillars.map((pillar) => {
        const files = evidence[pillar.key];
        if (!files || files.length === 0) return null;

        return (
          <div key={pillar.key} className="mb-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              {pillar.label}
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium uppercase text-gray-500">
                  <th className="pb-2 pr-4 w-8">#</th>
                  <th className="pb-2 pr-4">File Name</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2">Link</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="font-medium text-gray-800 truncate max-w-[300px]">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{file.section}</td>
                    <td className="py-2 text-blue-600 truncate max-w-[280px]">{file.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
