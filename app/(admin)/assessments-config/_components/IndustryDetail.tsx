"use client";

import { ChevronRight, Pencil, Plus, HardHat } from "lucide-react";
import { useState } from "react";
import { FaLeaf } from "react-icons/fa";
import { PiUsersFill } from "react-icons/pi";
import { TbBriefcaseFilled } from "react-icons/tb";
import { VscLaw } from "react-icons/vsc";
import Breadcrumb from "./Breadcrumb";
import SectorIndustryEditorModal, {
  type SectorIndustryPayload,
} from "./SectorIndustryEditorModal";
import StatTile from "./StatTile";
import TopicEditorModal, { type NewTopicPayload } from "./TopicEditorModal";
import {
  PILLAR_LABELS,
  type Industry,
  type PillarKey,
  type Sector,
  type Topic,
} from "../_fixtures/types";

interface IndustryDetailProps {
  sector: Sector;
  industry: Industry;
  onBackToSectors: () => void;
  onBackToSector: () => void;
  onSelectTopic: (topic: Topic, pillarId: string) => void;
  onUpdateIndustry: (payload: SectorIndustryPayload) => void;
  onUpsertTopic: (payload: NewTopicPayload, existingTopicId?: string) => void;
}

/** Pillar visual tokens — kept in lockstep with the company-side dashboard
 * (PillarScoresRow / page.tsx) so admins and end-users see the same mark. */
const PILLAR_VISUAL: Record<
  PillarKey,
  { Icon: React.ComponentType<{ className?: string }>; bg: string; fg: string }
> = {
  environmental: { Icon: FaLeaf, bg: "#f1fcf4", fg: "#1e8a3d" },
  socialCapital: { Icon: PiUsersFill, bg: "#eff5ff", fg: "#2570eb" },
  humanCapital: { Icon: HardHat, bg: "#FEF9C3", fg: "#F59E0B" },
  businessModel: { Icon: TbBriefcaseFilled, bg: "#f5e2ff", fg: "#af57db" },
  leadershipGovernance: { Icon: VscLaw, bg: "#e8e8e8", fg: "#4a4a4a" },
};

export default function IndustryDetail({
  sector,
  industry,
  onBackToSectors,
  onBackToSector,
  onSelectTopic,
  onUpdateIndustry,
  onUpsertTopic,
}: IndustryDetailProps) {
  const totalTopics = industry.pillars.reduce((s, p) => s + p.topics.length, 0);
  const totalSubMetrics = industry.pillars.reduce(
    (s, p) => s + p.topics.reduce((ss, t) => ss + t.subMetrics.length, 0),
    0
  );

  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [topicModal, setTopicModal] = useState<{ open: boolean; defaultPillarKey?: PillarKey }>({
    open: false,
  });

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb
        crumbs={[
          { label: "Sectors", onClick: onBackToSectors },
          { label: sector.name, onClick: onBackToSector },
          { label: industry.name },
        ]}
      />

      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{industry.name}</h2>
          <p className="text-sm text-gray-700 mt-0.5 max-w-2xl">{industry.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIndustryModalOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            <Pencil className="w-4 h-4" />
            Edit Industry
          </button>
          <button
            type="button"
            onClick={() => setTopicModal({ open: true })}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Topic
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Disclosure Topics" value={totalTopics} />
        <StatTile label="Pillars" value={industry.pillars.length} />
        <StatTile label="Sub-metrics" value={totalSubMetrics} />
        <StatTile label="SASB Code" value={industry.sasbCode} />
      </div>

      <section className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Disclosure Topics</h3>
        <div className="space-y-5">
          {industry.pillars.map((pillar) => {
            const meta = PILLAR_VISUAL[pillar.key];
            const Icon = meta.Icon;
            return (
              <div key={pillar.id}>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: meta.bg, color: meta.fg }}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-semibold text-gray-900 flex-1">
                    {PILLAR_LABELS[pillar.key]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTopicModal({ open: true, defaultPillarKey: pillar.key })}
                    className="text-xs text-[#119B95] hover:underline inline-flex items-center gap-1"
                    aria-label={`Add topic to ${PILLAR_LABELS[pillar.key]}`}
                  >
                    <Plus className="w-3 h-3" /> Add Topic
                  </button>
                </div>
                {pillar.topics.length === 0 ? (
                  <p className="text-xs text-gray-700 mt-3 px-3">No topics defined yet.</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
                    {pillar.topics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => onSelectTopic(topic, pillar.id)}
                        className="flex items-start justify-between gap-3 px-3 py-3 rounded-md hover:bg-gray-50 text-left transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{topic.name}</p>
                          <p className="text-xs text-gray-700 mt-0.5">
                            {topic.formCountLabel ? `${topic.formCountLabel} · ` : ""}
                            {topic.ifrsCode}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <SectorIndustryEditorModal
        open={industryModalOpen}
        onOpenChange={setIndustryModalOpen}
        kind="industry"
        initial={{
          name: industry.name,
          code: industry.code,
          sasbCode: industry.sasbCode,
          description: industry.description,
        }}
        onSave={onUpdateIndustry}
      />

      <TopicEditorModal
        open={topicModal.open}
        onOpenChange={(next) => setTopicModal((m) => ({ ...m, open: next }))}
        industry={industry}
        defaultPillarKey={topicModal.defaultPillarKey}
        onSave={onUpsertTopic}
      />
    </div>
  );
}
