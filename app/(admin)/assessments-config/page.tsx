"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";
import LeftTreeNav, { type Selection } from "./_components/LeftTreeNav";
import SectorsOverview from "./_components/SectorsOverview";
import SectorDetail from "./_components/SectorDetail";
import IndustryDetail from "./_components/IndustryDetail";
import TopicDetail from "./_components/TopicDetail";
import SubMetricDetail from "./_components/SubMetricDetail";
import { sectors as initialSectors } from "./_fixtures/sectors";
import type {
  Group,
  Industry,
  PillarSection,
  Sector,
  SubMetric,
  Topic,
} from "./_fixtures/types";
import type { NewTopicPayload } from "./_components/TopicEditorModal";
import type { SectorIndustryPayload } from "./_components/SectorIndustryEditorModal";
import type { SubMetricPayload } from "./_components/SubMetricEditorModal";

function findSector(sectors: Sector[], id: string | undefined) {
  return id ? sectors.find((s) => s.id === id) ?? null : null;
}
function findIndustry(sector: Sector | null, id: string | undefined) {
  return sector && id ? sector.industries.find((i) => i.id === id) ?? null : null;
}
function findPillarTopic(industry: Industry | null, pillarId: string | undefined, topicId: string | undefined) {
  if (!industry || !pillarId || !topicId) return null;
  const pillar = industry.pillars.find((p) => p.id === pillarId);
  return pillar?.topics.find((t) => t.id === topicId) ?? null;
}

let topicCounter = 0;
const newTopicId = () => `t_new_${Date.now()}_${++topicCounter}`;
let sectorCounter = 0;
const newSectorId = () => `s_new_${Date.now()}_${++sectorCounter}`;
let industryCounter = 0;
const newIndustryId = () => `i_new_${Date.now()}_${++industryCounter}`;
let submetricCounter = 0;
const newSubMetricId = () => `sm_new_${Date.now()}_${++submetricCounter}`;

const blankPillars = (): PillarSection[] => [
  { id: `p_env_${Date.now()}`, key: "environmental", topics: [] },
  { id: `p_social_${Date.now() + 1}`, key: "socialCapital", topics: [] },
  { id: `p_human_${Date.now() + 2}`, key: "humanCapital", topics: [] },
  { id: `p_business_${Date.now() + 3}`, key: "businessModel", topics: [] },
  { id: `p_lead_${Date.now() + 4}`, key: "leadershipGovernance", topics: [] },
];

export default function AdminAssessmentsPage() {
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const sel: any = selection;
  const sector = findSector(sectors, sel?.sectorId);
  const industry = findIndustry(sector, sel?.industryId);
  const topic = findPillarTopic(industry, sel?.pillarId, sel?.topicId);

  const upsertSector = (payload: SectorIndustryPayload, existingId?: string) =>
    setSectors((prev) => {
      if (existingId) {
        return prev.map((s) => (s.id !== existingId ? s : { ...s, ...payload }));
      }
      const fresh: Sector = {
        id: newSectorId(),
        name: payload.name,
        code: payload.code,
        sasbCode: payload.sasbCode,
        description: payload.description,
        industries: [],
      };
      return [...prev, fresh];
    });

  const upsertIndustry = (
    sectorId: string,
    payload: SectorIndustryPayload,
    existingId?: string
  ) =>
    setSectors((prev) =>
      prev.map((s) => {
        if (s.id !== sectorId) return s;
        if (existingId) {
          return {
            ...s,
            industries: s.industries.map((i) =>
              i.id !== existingId ? i : { ...i, ...payload }
            ),
          };
        }
        const fresh: Industry = {
          id: newIndustryId(),
          name: payload.name,
          code: payload.code,
          sasbCode: payload.sasbCode,
          description: payload.description,
          pillars: blankPillars(),
        };
        return { ...s, industries: [...s.industries, fresh] };
      })
    );

  const upsertTopic = (
    sectorId: string,
    industryId: string,
    payload: NewTopicPayload,
    existingTopicId?: string
  ) =>
    setSectors((prev) =>
      prev.map((s) => {
        if (s.id !== sectorId) return s;
        return {
          ...s,
          industries: s.industries.map((i) => {
            if (i.id !== industryId) return i;

            const existingTopic = existingTopicId
              ? i.pillars.flatMap((p) => p.topics).find((t) => t.id === existingTopicId)
              : null;

            const topicId = existingTopicId ?? newTopicId();
            const upserted: Topic = {
              id: topicId,
              name: payload.name,
              description: payload.description,
              ifrsCode: payload.ifrsCode,
              formCountLabel: payload.formCountLabel,
              subMetrics: existingTopic?.subMetrics ?? [],
            };

            const cleaned = existingTopicId
              ? i.pillars.map((p) => ({
                  ...p,
                  topics: p.topics.filter((t) => t.id !== existingTopicId),
                }))
              : i.pillars;

            return {
              ...i,
              pillars: cleaned.map((p) =>
                p.key === payload.pillarKey ? { ...p, topics: [...p.topics, upserted] } : p
              ),
            };
          }),
        };
      })
    );

  const mutateSubMetric = (
    sectorId: string,
    industryId: string,
    pillarId: string,
    topicId: string,
    submetricId: string,
    fn: (sub: SubMetric) => SubMetric
  ) =>
    setSectors((prev) =>
      prev.map((s) =>
        s.id !== sectorId
          ? s
          : {
              ...s,
              industries: s.industries.map((i) =>
                i.id !== industryId
                  ? i
                  : {
                      ...i,
                      pillars: i.pillars.map((p) =>
                        p.id !== pillarId
                          ? p
                          : {
                              ...p,
                              topics: p.topics.map((t) =>
                                t.id !== topicId
                                  ? t
                                  : {
                                      ...t,
                                      subMetrics: t.subMetrics.map((sub) =>
                                        sub.id !== submetricId ? sub : fn(sub)
                                      ),
                                    }
                              ),
                            }
                      ),
                    }
              ),
            }
      )
    );

  const upsertSubMetric = (
    sectorId: string,
    industryId: string,
    pillarId: string,
    topicId: string,
    payload: SubMetricPayload,
    existingId?: string
  ) =>
    setSectors((prev) =>
      prev.map((s) =>
        s.id !== sectorId
          ? s
          : {
              ...s,
              industries: s.industries.map((i) =>
                i.id !== industryId
                  ? i
                  : {
                      ...i,
                      pillars: i.pillars.map((p) =>
                        p.id !== pillarId
                          ? p
                          : {
                              ...p,
                              topics: p.topics.map((t) => {
                                if (t.id !== topicId) return t;
                                if (existingId) {
                                  return {
                                    ...t,
                                    subMetrics: t.subMetrics.map((sub) =>
                                      sub.id !== existingId
                                        ? sub
                                        : {
                                            ...sub,
                                            name: payload.name,
                                            category: payload.category || undefined,
                                            description: payload.description || undefined,
                                          }
                                    ),
                                  };
                                }
                                const fresh: SubMetric = {
                                  id: newSubMetricId(),
                                  name: payload.name,
                                  category: payload.category || undefined,
                                  description: payload.description || undefined,
                                  groups: [],
                                };
                                return { ...t, subMetrics: [...t.subMetrics, fresh] };
                              }),
                            }
                      ),
                    }
              ),
            }
      )
    );

  const setSubMetricGroups = (
    sectorId: string,
    industryId: string,
    pillarId: string,
    topicId: string,
    submetricId: string,
    nextGroups: Group[]
  ) =>
    mutateSubMetric(sectorId, industryId, pillarId, topicId, submetricId, (sub) => ({
      ...sub,
      groups: nextGroups,
      leafLabels: nextGroups.map((g) => g.name),
    }));

  const handleSelectSector = (s: Sector) => {
    setSelection({ level: "sector", sectorId: s.id });
    setExpanded((prev) => new Set(prev).add(s.id));
  };

  const handleSelectIndustry = (s: Sector, i: Industry) => {
    setSelection({ level: "industry", sectorId: s.id, industryId: i.id });
    setExpanded((prev) => new Set(prev).add(s.id).add(`${s.id}>${i.id}`));
  };

  const handleSelectTopic = (s: Sector, i: Industry, pillarId: string, t: Topic) => {
    setSelection({ level: "topic", sectorId: s.id, industryId: i.id, pillarId, topicId: t.id });
    const next = new Set(expanded);
    next.add(s.id);
    next.add(`${s.id}>${i.id}`);
    next.add(`${s.id}>${i.id}>${pillarId}`);
    next.add(`${s.id}>${i.id}>${pillarId}>${t.id}`);
    setExpanded(next);
  };

  const handleSelectSubMetric = (
    s: Sector,
    i: Industry,
    pillarId: string,
    t: Topic,
    sub: SubMetric
  ) => {
    setSelection({
      level: "submetric",
      sectorId: s.id,
      industryId: i.id,
      pillarId,
      topicId: t.id,
      submetricId: sub.id,
    });
  };

  return (
    <>
      <AdminNavbar
        title="ESG Pillar Management"
        subtitle="Sectors, industries, pillars, topics and metrics"
      />

      <motion.div
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 sm:gap-6 min-h-[70vh]">
          <LeftTreeNav
            sectors={sectors}
            selection={selection}
            expanded={expanded}
            onExpandedChange={setExpanded}
            onSelect={setSelection}
          />

          <div className="bg-white/60 rounded-xl">
            {!selection || selection.level === "sector" ? (
              !sector ? (
                <SectorsOverview
                  sectors={sectors}
                  onSelectSector={handleSelectSector}
                  onAddSector={(payload) => upsertSector(payload)}
                />
              ) : (
                <SectorDetail
                  sector={sector}
                  onBackToSectors={() => setSelection(null)}
                  onSelectIndustry={(i) => handleSelectIndustry(sector, i)}
                  onUpdateSector={(payload) => upsertSector(payload, sector.id)}
                  onAddIndustry={(payload) => upsertIndustry(sector.id, payload)}
                />
              )
            ) : null}

            {selection?.level === "industry" && sector && industry && (
              <IndustryDetail
                sector={sector}
                industry={industry}
                onBackToSectors={() => setSelection(null)}
                onBackToSector={() => setSelection({ level: "sector", sectorId: sector.id })}
                onSelectTopic={(t, pillarId) => handleSelectTopic(sector, industry, pillarId, t)}
                onUpdateIndustry={(payload) => upsertIndustry(sector.id, payload, industry.id)}
                onUpsertTopic={(payload, existingTopicId) =>
                  upsertTopic(sector.id, industry.id, payload, existingTopicId)
                }
              />
            )}

            {selection?.level === "topic" && sector && industry && topic && (
              <TopicDetail
                sector={sector}
                industry={industry}
                topic={topic}
                onBackToSectors={() => setSelection(null)}
                onBackToSector={() => setSelection({ level: "sector", sectorId: sector.id })}
                onBackToIndustry={() =>
                  setSelection({ level: "industry", sectorId: sector.id, industryId: industry.id })
                }
                onSelectSubMetric={(sub) =>
                  handleSelectSubMetric(sector, industry, sel.pillarId, topic, sub)
                }
                onUpsertTopic={(payload, existingTopicId) =>
                  upsertTopic(sector.id, industry.id, payload, existingTopicId)
                }
                onAddSubMetric={(payload) =>
                  upsertSubMetric(sector.id, industry.id, sel.pillarId, topic.id, payload)
                }
              />
            )}

            {selection?.level === "pillar" && sector && industry && (
              <IndustryDetail
                sector={sector}
                industry={industry}
                onBackToSectors={() => setSelection(null)}
                onBackToSector={() => setSelection({ level: "sector", sectorId: sector.id })}
                onSelectTopic={(t, pillarId) => handleSelectTopic(sector, industry, pillarId, t)}
                onUpdateIndustry={(payload) => upsertIndustry(sector.id, payload, industry.id)}
                onUpsertTopic={(payload, existingTopicId) =>
                  upsertTopic(sector.id, industry.id, payload, existingTopicId)
                }
              />
            )}

            {selection?.level === "submetric" && sector && industry && topic && (() => {
              const subMetric = topic.subMetrics.find((s) => s.id === sel.submetricId);
              const pillar = industry.pillars.find((p) => p.id === sel.pillarId);
              if (!subMetric || !pillar) return null;
              return (
                <SubMetricDetail
                  key={subMetric.id}
                  sector={sector}
                  industry={industry}
                  topic={topic}
                  pillarKey={pillar.key}
                  subMetric={subMetric}
                  onBackToSectors={() => setSelection(null)}
                  onBackToSector={() => setSelection({ level: "sector", sectorId: sector.id })}
                  onBackToIndustry={() =>
                    setSelection({ level: "industry", sectorId: sector.id, industryId: industry.id })
                  }
                  onBackToTopic={() =>
                    setSelection({
                      level: "topic",
                      sectorId: sector.id,
                      industryId: industry.id,
                      pillarId: sel.pillarId,
                      topicId: topic.id,
                    })
                  }
                  onGroupsChange={(next) =>
                    setSubMetricGroups(
                      sector.id,
                      industry.id,
                      pillar.id,
                      topic.id,
                      subMetric.id,
                      next
                    )
                  }
                />
              );
            })()}
          </div>
        </div>
      </motion.div>
    </>
  );
}
