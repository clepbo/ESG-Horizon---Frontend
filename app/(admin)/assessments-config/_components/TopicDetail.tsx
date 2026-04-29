"use client";

import { ChevronRight, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import Breadcrumb from "./Breadcrumb";
import SubMetricEditorModal, { type SubMetricPayload } from "./SubMetricEditorModal";
import TopicEditorModal, { type NewTopicPayload } from "./TopicEditorModal";
import type { Industry, Sector, SubMetric, Topic } from "../_fixtures/types";

interface TopicDetailProps {
  sector: Sector;
  industry: Industry;
  topic: Topic;
  onBackToSectors: () => void;
  onBackToSector: () => void;
  onBackToIndustry: () => void;
  onSelectSubMetric: (sub: SubMetric) => void;
  onUpsertTopic: (payload: NewTopicPayload, existingTopicId?: string) => void;
  onAddSubMetric: (payload: SubMetricPayload) => void;
}

export default function TopicDetail({
  sector,
  industry,
  topic,
  onBackToSectors,
  onBackToSector,
  onBackToIndustry,
  onSelectSubMetric,
  onUpsertTopic,
  onAddSubMetric,
}: TopicDetailProps) {
  const [editTopicOpen, setEditTopicOpen] = useState(false);
  const [addMetricOpen, setAddMetricOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb
        crumbs={[
          { label: "Sectors", onClick: onBackToSectors },
          { label: sector.name, onClick: onBackToSector },
          { label: industry.name, onClick: onBackToIndustry },
          { label: topic.name },
        ]}
      />

      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{topic.name}</h2>
          <p className="text-sm text-gray-700 mt-0.5 max-w-2xl">{topic.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditTopicOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            <Pencil className="w-4 h-4" />
            Edit Topic
          </button>
          <button
            type="button"
            onClick={() => setAddMetricOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Metric
          </button>
        </div>
      </header>

      <section className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Sub-metrics</h3>
        {topic.subMetrics.length === 0 ? (
          <div className="py-6 sm:py-8 flex flex-col items-center text-center">
            <p className="text-sm text-gray-700 max-w-md">
              No sub-metrics for <span className="font-medium">{topic.name}</span> yet. Sub-metrics
              break a topic into the disclosure scopes companies fill out (e.g. Scope 1, Scope 2,
              Scope 3).
            </p>
            <button
              type="button"
              onClick={() => setAddMetricOpen(true)}
              className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add Metric
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {topic.subMetrics.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubMetric(sub)}
                className="w-full flex items-start justify-between gap-3 px-4 py-3 rounded-md hover:bg-gray-50 text-left transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-sm font-semibold text-gray-900">{sub.name}</span>
                    {sub.category && (
                      <span className="text-xs font-semibold tracking-widest uppercase text-gray-700">
                        {sub.category}
                      </span>
                    )}
                  </div>
                  {sub.leafLabels && sub.leafLabels.length > 0 && (
                    <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                      {sub.leafLabels.join(" · ")}
                    </p>
                  )}
                  {sub.description && (
                    <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{sub.description}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        )}
      </section>

      <TopicEditorModal
        open={editTopicOpen}
        onOpenChange={setEditTopicOpen}
        industry={industry}
        initial={topic}
        onSave={onUpsertTopic}
      />

      <SubMetricEditorModal
        open={addMetricOpen}
        onOpenChange={setAddMetricOpen}
        onSave={onAddSubMetric}
      />
    </div>
  );
}
