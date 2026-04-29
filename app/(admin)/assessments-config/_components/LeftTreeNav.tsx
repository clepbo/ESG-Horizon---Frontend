"use client";

import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import LevelBadge from "./LevelBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { PILLAR_LABELS, type LevelKey, type Sector } from "../_fixtures/types";

export type Selection =
  | { level: "sector"; sectorId: string }
  | { level: "industry"; sectorId: string; industryId: string }
  | { level: "pillar"; sectorId: string; industryId: string; pillarId: string }
  | { level: "topic"; sectorId: string; industryId: string; pillarId: string; topicId: string }
  | {
      level: "submetric";
      sectorId: string;
      industryId: string;
      pillarId: string;
      topicId: string;
      submetricId: string;
    };

interface LeftTreeNavProps {
  sectors: Sector[];
  selection: Selection | null;
  onSelect: (s: Selection) => void;
  /** Set of expanded node ids (sector / industry / pillar / topic). */
  expanded: Set<string>;
  onExpandedChange: (next: Set<string>) => void;
}

function isOnPath(selection: Selection | null, ids: { sectorId?: string; industryId?: string; pillarId?: string; topicId?: string; submetricId?: string }): boolean {
  if (!selection) return false;
  const s: any = selection;
  return (
    (ids.sectorId == null || s.sectorId === ids.sectorId) &&
    (ids.industryId == null || s.industryId === ids.industryId) &&
    (ids.pillarId == null || s.pillarId === ids.pillarId) &&
    (ids.topicId == null || s.topicId === ids.topicId) &&
    (ids.submetricId == null || s.submetricId === ids.submetricId)
  );
}

export default function LeftTreeNav({ sectors, selection, onSelect, expanded, onExpandedChange }: LeftTreeNavProps) {
  const [query, setQuery] = useState("");

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onExpandedChange(next);
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return sectors;
    const q = query.toLowerCase();
    return sectors.filter((s) => s.name.toLowerCase().includes(q));
  }, [query, sectors]);

  return (
    <TooltipProvider delayDuration={250}>
    <aside className="bg-white rounded-xl border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full h-10 pl-10 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 focus:border-[#119B95]/40 placeholder:text-gray-500 text-gray-900"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {filtered.map((sector) => {
          const sectorOpen = expanded.has(sector.id);
          const sectorActive = selection?.level === "sector" && (selection as any).sectorId === sector.id;
          return (
            <div key={sector.id}>
              <NodeRow
                level="sector"
                label={sector.name}
                code={sector.code}
                count={sector.industries.length}
                hasChildren={sector.industries.length > 0}
                expanded={sectorOpen}
                active={sectorActive}
                onChevronClick={() => toggle(sector.id)}
                onLabelClick={() => {
                  toggle(sector.id);
                  onSelect({ level: "sector", sectorId: sector.id });
                }}
                depth={0}
              />
              {sectorOpen &&
                sector.industries.map((industry) => {
                  const industryNodeId = `${sector.id}>${industry.id}`;
                  const industryOpen = expanded.has(industryNodeId);
                  const industryActive =
                    selection?.level === "industry" &&
                    isOnPath(selection, { sectorId: sector.id, industryId: industry.id });
                  return (
                    <div key={industry.id}>
                      <NodeRow
                        level="industry"
                        label={industry.name}
                        code={industry.code}
                        count={industry.pillars.length}
                        hasChildren={industry.pillars.length > 0}
                        expanded={industryOpen}
                        active={industryActive}
                        onChevronClick={() => toggle(industryNodeId)}
                        onLabelClick={() => {
                          toggle(industryNodeId);
                          onSelect({ level: "industry", sectorId: sector.id, industryId: industry.id });
                        }}
                        depth={1}
                      />
                      {industryOpen &&
                        industry.pillars.map((pillar) => {
                          const pillarNodeId = `${industryNodeId}>${pillar.id}`;
                          const pillarOpen = expanded.has(pillarNodeId);
                          const pillarActive =
                            selection?.level === "pillar" &&
                            isOnPath(selection, {
                              sectorId: sector.id,
                              industryId: industry.id,
                              pillarId: pillar.id,
                            });
                          return (
                            <div key={pillar.id}>
                              <NodeRow
                                level="pillar"
                                label={PILLAR_LABELS[pillar.key]}
                                count={pillar.topics.length}
                                hasChildren={pillar.topics.length > 0}
                                expanded={pillarOpen}
                                active={pillarActive}
                                onChevronClick={() => toggle(pillarNodeId)}
                                onLabelClick={() => {
                                  toggle(pillarNodeId);
                                  onSelect({
                                    level: "pillar",
                                    sectorId: sector.id,
                                    industryId: industry.id,
                                    pillarId: pillar.id,
                                  });
                                }}
                                depth={2}
                              />
                              {pillarOpen &&
                                pillar.topics.map((topic) => {
                                  const topicNodeId = `${pillarNodeId}>${topic.id}`;
                                  const topicOpen = expanded.has(topicNodeId);
                                  const topicActive =
                                    selection?.level === "topic" &&
                                    isOnPath(selection, {
                                      sectorId: sector.id,
                                      industryId: industry.id,
                                      pillarId: pillar.id,
                                      topicId: topic.id,
                                    });
                                  return (
                                    <div key={topic.id}>
                                      <NodeRow
                                        level="topic"
                                        label={topic.name}
                                        count={topic.subMetrics.length}
                                        hasChildren={topic.subMetrics.length > 0}
                                        expanded={topicOpen}
                                        active={topicActive}
                                        onChevronClick={() => toggle(topicNodeId)}
                                        onLabelClick={() => {
                                          toggle(topicNodeId);
                                          onSelect({
                                            level: "topic",
                                            sectorId: sector.id,
                                            industryId: industry.id,
                                            pillarId: pillar.id,
                                            topicId: topic.id,
                                          });
                                        }}
                                        depth={3}
                                      />
                                      {topicOpen &&
                                        topic.subMetrics.map((sub) => {
                                          const submetricActive =
                                            selection?.level === "submetric" &&
                                            isOnPath(selection, {
                                              sectorId: sector.id,
                                              industryId: industry.id,
                                              pillarId: pillar.id,
                                              topicId: topic.id,
                                              submetricId: sub.id,
                                            });
                                          return (
                                            <NodeRow
                                              key={sub.id}
                                              level="submetric"
                                              label={sub.name}
                                              hasChildren={false}
                                              active={submetricActive}
                                              onLabelClick={() =>
                                                onSelect({
                                                  level: "submetric",
                                                  sectorId: sector.id,
                                                  industryId: industry.id,
                                                  pillarId: pillar.id,
                                                  topicId: topic.id,
                                                  submetricId: sub.id,
                                                })
                                              }
                                              depth={4}
                                            />
                                          );
                                        })}
                                    </div>
                                  );
                                })}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </aside>
    </TooltipProvider>
  );
}

interface NodeRowProps {
  level: LevelKey;
  label: string;
  code?: string;
  count?: number;
  hasChildren: boolean;
  expanded?: boolean;
  active?: boolean;
  onChevronClick?: () => void;
  onLabelClick: () => void;
  depth: number;
}

function NodeRow({
  level,
  label,
  count,
  hasChildren,
  expanded,
  active,
  onChevronClick,
  onLabelClick,
  depth,
}: NodeRowProps) {
  return (
    <div
      className={`flex items-center gap-2 pr-3 py-1.5 text-sm cursor-pointer transition-colors ${
        active ? "bg-[#119B95]/10 text-[#119B95]" : "text-gray-800 hover:bg-gray-50"
      }`}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
      onClick={onLabelClick}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChevronClick?.();
        }}
        className={`shrink-0 w-4 h-4 flex items-center justify-center text-gray-600 ${
          hasChildren ? "" : "invisible"
        }`}
        aria-label={expanded ? "Collapse" : "Expand"}
      >
        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      <LevelBadge level={level} />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex-1 truncate">{label}</span>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          {label}
        </TooltipContent>
      </Tooltip>
      {typeof count === "number" && (
        <span className="text-xs text-gray-700 shrink-0">{count}</span>
      )}
    </div>
  );
}
