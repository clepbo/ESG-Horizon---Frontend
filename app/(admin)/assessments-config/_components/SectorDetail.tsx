"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import Breadcrumb from "./Breadcrumb";
import SectorIndustryEditorModal, {
  type SectorIndustryPayload,
} from "./SectorIndustryEditorModal";
import StatTile from "./StatTile";
import {
  countIndustries,
  countSubMetricsInSector,
  countTopicsInSector,
  type Industry,
  type Sector,
} from "../_fixtures/types";

interface SectorDetailProps {
  sector: Sector;
  onBackToSectors: () => void;
  onSelectIndustry: (industry: Industry) => void;
  onUpdateSector: (payload: SectorIndustryPayload) => void;
  onAddIndustry: (payload: SectorIndustryPayload) => void;
}

export default function SectorDetail({
  sector,
  onBackToSectors,
  onSelectIndustry,
  onUpdateSector,
  onAddIndustry,
}: SectorDetailProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb crumbs={[{ label: "Sectors", onClick: onBackToSectors }, { label: sector.name }]} />

      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{sector.name}</h2>
          <p className="text-sm text-gray-700 mt-0.5 max-w-2xl">{sector.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            <Pencil className="w-4 h-4" />
            Edit Sector
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Industry
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Industries" value={countIndustries(sector)} />
        <StatTile label="Topics" value={countTopicsInSector(sector)} />
        <StatTile label="Sub-metrics" value={countSubMetricsInSector(sector)} />
        <StatTile label="SASB Code" value={sector.sasbCode} />
      </div>

      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Industries in this sector</h3>
        {sector.industries.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 sm:p-10 flex flex-col items-center text-center">
            <p className="text-sm text-gray-700 max-w-md">
              No industries in this sector yet. Industries are the SASB classifications under{" "}
              <span className="font-medium">{sector.name}</span> that companies pick from.
            </p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add Industry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sector.industries.map((industry) => (
              <button
                key={industry.id}
                type="button"
                onClick={() => onSelectIndustry(industry)}
                className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-[#119B95]/40 hover:shadow-sm transition-all"
              >
                <h4 className="text-base font-bold text-gray-900">{industry.name}</h4>
                <p className="text-xs text-gray-700 mt-0.5">
                  {industry.code} · {industry.pillars.reduce((s, p) => s + p.topics.length, 0)} Topics
                </p>
                <p className="text-sm text-gray-700 mt-3 leading-relaxed line-clamp-4">
                  {industry.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      <SectorIndustryEditorModal
        open={editOpen}
        onOpenChange={setEditOpen}
        kind="sector"
        initial={{
          name: sector.name,
          code: sector.code,
          sasbCode: sector.sasbCode,
          description: sector.description,
        }}
        onSave={onUpdateSector}
      />

      <SectorIndustryEditorModal
        open={addOpen}
        onOpenChange={setAddOpen}
        kind="industry"
        onSave={onAddIndustry}
      />
    </div>
  );
}
