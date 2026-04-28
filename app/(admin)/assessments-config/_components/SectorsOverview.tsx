"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import SectorIndustryEditorModal, {
  type SectorIndustryPayload,
} from "./SectorIndustryEditorModal";
import StatTile from "./StatTile";
import { countTopicsInSector, type Sector } from "../_fixtures/types";

interface SectorsOverviewProps {
  sectors: Sector[];
  onSelectSector: (sector: Sector) => void;
  onAddSector: (payload: SectorIndustryPayload) => void;
}

export default function SectorsOverview({ sectors, onSelectSector, onAddSector }: SectorsOverviewProps) {
  const [addOpen, setAddOpen] = useState(false);
  const totalSectors = sectors.length;
  const totalIndustries = sectors.reduce((s, x) => s + x.industries.length, 0);
  const totalTopics = sectors.reduce((s, x) => s + countTopicsInSector(x), 0);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sectors</h2>
          <p className="text-sm text-gray-700 mt-0.5 max-w-2xl">
            Manage the SASB sector and industry taxonomy that powers ESG assessments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Sector
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Sectors" value={totalSectors} />
        <StatTile label="Industries" value={totalIndustries} />
        <StatTile label="Disclosure Topics" value={totalTopics} />
        <StatTile label="Framework" value="SASB" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sectors.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectSector(s)}
            className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-[#119B95]/40 hover:shadow-sm transition-all"
          >
            <h3 className="text-base font-bold text-gray-900">{s.name}</h3>
            <p className="text-xs text-gray-700 mt-0.5">{s.industries.length} Industries</p>
            <p className="text-sm text-gray-700 mt-3 leading-relaxed line-clamp-3">
              {s.description}
            </p>
          </button>
        ))}
      </div>

      <SectorIndustryEditorModal
        open={addOpen}
        onOpenChange={setAddOpen}
        kind="sector"
        onSave={onAddSector}
      />
    </div>
  );
}
