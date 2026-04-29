"use client";

import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Breadcrumb from "./Breadcrumb";
import GroupBlock from "./GroupBlock";
import GroupEditorModal, { type GroupPayload } from "./GroupEditorModal";
import QuestionEditorModal from "./QuestionEditorModal";
import {
  type Group,
  type Industry,
  type PillarKey,
  type Question,
  type QuestionStatus,
  type Section,
  type Sector,
  type SubMetric,
  type Topic,
} from "../_fixtures/types";

interface SubMetricDetailProps {
  sector: Sector;
  industry: Industry;
  topic: Topic;
  pillarKey: PillarKey;
  subMetric: SubMetric;
  onBackToSectors: () => void;
  onBackToSector: () => void;
  onBackToIndustry: () => void;
  onBackToTopic: () => void;
  /** Called whenever the sub-metric's groups (or their sections/questions) change. */
  onGroupsChange: (next: Group[]) => void;
}

interface ModalContext {
  open: boolean;
  groupId: string | null;
  sectionId: string | null;
  initial?: Question;
}

let questionCounter = 0;
const newQuestionId = () => `q_new_${Date.now()}_${++questionCounter}`;

function renumberSection(section: Section, sectionIndex: number): Section {
  return {
    ...section,
    questions: section.questions.map((q, qi) => ({
      ...q,
      number: `${sectionIndex + 1}.${qi + 1}`,
    })),
  };
}

function renumberGroup(group: Group): Group {
  return { ...group, sections: group.sections.map(renumberSection) };
}

export default function SubMetricDetail({
  sector,
  industry,
  topic,
  pillarKey,
  subMetric,
  onBackToSectors,
  onBackToSector,
  onBackToIndustry,
  onBackToTopic,
  onGroupsChange,
}: SubMetricDetailProps) {
  const [groups, setGroups] = useState<Group[]>(() =>
    (subMetric.groups ?? []).map(renumberGroup)
  );
  const [modal, setModal] = useState<ModalContext>({
    open: false,
    groupId: null,
    sectionId: null,
  });
  const [groupModal, setGroupModal] = useState<{
    open: boolean;
    /** Defined when editing an existing group; undefined when adding. */
    initial?: Group;
    /** Index after which a newly-added group should be inserted; undefined = append. */
    insertAfter?: number;
  }>({ open: false });

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onGroupsChange(groups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const topicOptions = useMemo(
    () =>
      industry.pillars.flatMap((p) =>
        p.topics.map((t) => ({ id: t.id, name: t.name, pillarKey: p.key }))
      ),
    [industry]
  );

  const updateGroup = (groupId: string, fn: (g: Group) => Group) =>
    setGroups((prev) => prev.map((g) => (g.id === groupId ? renumberGroup(fn(g)) : g)));

  /* ---------- Group-level mutations ---------- */

  const handleMoveGroupUp = (groupId: string) =>
    setGroups((prev) => {
      const i = prev.findIndex((g) => g.id === groupId);
      if (i <= 0) return prev;
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });

  const handleMoveGroupDown = (groupId: string) =>
    setGroups((prev) => {
      const i = prev.findIndex((g) => g.id === groupId);
      if (i < 0 || i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });

  const handleDuplicateGroup = (groupId: string) =>
    setGroups((prev) => {
      const i = prev.findIndex((g) => g.id === groupId);
      if (i < 0) return prev;
      const src = prev[i];
      const stamp = Date.now();
      const clone: Group = {
        ...src,
        id: `${src.id}_copy_${stamp}`,
        name: `${src.name} (Copy)`,
        groupKey: src.groupKey ? `${src.groupKey}Copy` : src.groupKey,
        sections: src.sections.map((s, si) => ({
          ...s,
          id: `${s.id}_copy_${stamp}`,
          questions: s.questions.map((q, qi) => ({
            ...q,
            id: `${q.id}_copy_${stamp}`,
            number: `${si + 1}.${qi + 1}`,
            responses: q.responses.map((r) => ({ ...r, id: `${r.id}_copy_${stamp}` })),
          })),
        })),
      };
      const next = [...prev];
      next.splice(i + 1, 0, clone);
      return next;
    });

  const handleDeleteGroup = (groupId: string) =>
    setGroups((prev) => prev.filter((g) => g.id !== groupId));

  const openAddGroup = (afterGroupId?: string) => {
    const insertAfter =
      afterGroupId !== undefined
        ? groups.findIndex((g) => g.id === afterGroupId)
        : undefined;
    setGroupModal({
      open: true,
      initial: undefined,
      insertAfter: insertAfter !== undefined && insertAfter >= 0 ? insertAfter : undefined,
    });
  };

  const openEditGroup = (groupId: string) => {
    const target = groups.find((g) => g.id === groupId);
    if (!target) return;
    setGroupModal({ open: true, initial: target });
  };

  const handleSaveGroup = (payload: GroupPayload) => {
    if (groupModal.initial) {
      const id = groupModal.initial.id;
      updateGroup(id, (g) => ({
        ...g,
        name: payload.name,
        description: payload.description || undefined,
        groupKey: payload.groupKey,
      }));
      return;
    }
    const fresh: Group = {
      id: `g_new_${Date.now()}`,
      name: payload.name,
      description: payload.description || undefined,
      groupKey: payload.groupKey,
      sections: [],
    };
    setGroups((prev) => {
      if (groupModal.insertAfter === undefined) return [...prev, fresh];
      const next = [...prev];
      next.splice(groupModal.insertAfter + 1, 0, fresh);
      return next;
    });
  };

  const updateSection = (groupId: string, sectionId: string, fn: (s: Section) => Section) =>
    updateGroup(groupId, (g) => ({
      ...g,
      sections: g.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
    }));

  const handleMoveSectionUp = (groupId: string, sectionId: string) =>
    updateGroup(groupId, (g) => {
      const i = g.sections.findIndex((s) => s.id === sectionId);
      if (i <= 0) return g;
      const next = [...g.sections];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return { ...g, sections: next };
    });

  const handleMoveSectionDown = (groupId: string, sectionId: string) =>
    updateGroup(groupId, (g) => {
      const i = g.sections.findIndex((s) => s.id === sectionId);
      if (i < 0 || i === g.sections.length - 1) return g;
      const next = [...g.sections];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return { ...g, sections: next };
    });

  const handleAddSection = (groupId: string, afterSectionId?: string) =>
    updateGroup(groupId, (g) => {
      const newSection: Section = {
        id: `sec_new_${Date.now()}`,
        name: "New Section",
        description: "",
        questions: [],
      };
      if (!afterSectionId) {
        return { ...g, sections: [...g.sections, newSection] };
      }
      const idx = g.sections.findIndex((s) => s.id === afterSectionId);
      const next = [...g.sections];
      next.splice(idx + 1, 0, newSection);
      return { ...g, sections: next };
    });

  const handleDuplicateSection = (groupId: string, sectionId: string) =>
    updateGroup(groupId, (g) => {
      const idx = g.sections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return g;
      const src = g.sections[idx];
      const clone: Section = {
        ...src,
        id: `${src.id}_copy_${Date.now()}`,
        questions: src.questions.map((q) => ({
          ...q,
          id: `${q.id}_copy_${Date.now()}`,
          responses: q.responses.map((r) => ({ ...r })),
        })),
      };
      const next = [...g.sections];
      next.splice(idx + 1, 0, clone);
      return { ...g, sections: next };
    });

  const handleDeleteSection = (groupId: string, sectionId: string) =>
    updateGroup(groupId, (g) => ({ ...g, sections: g.sections.filter((s) => s.id !== sectionId) }));

  const handleMergeWithAbove = (groupId: string, sectionId: string) =>
    updateGroup(groupId, (g) => {
      const i = g.sections.findIndex((s) => s.id === sectionId);
      if (i <= 0) return g;
      const above = g.sections[i - 1];
      const here = g.sections[i];
      const merged: Section = {
        ...above,
        questions: [...above.questions, ...here.questions],
      };
      const next = [...g.sections];
      next.splice(i - 1, 2, merged);
      return { ...g, sections: next };
    });

  const handleDuplicateQuestion = (groupId: string, sectionId: string, q: Question) =>
    updateSection(groupId, sectionId, (s) => {
      const idx = s.questions.findIndex((x) => x.id === q.id);
      if (idx < 0) return s;
      const clone: Question = {
        ...q,
        id: newQuestionId(),
        responses: q.responses.map((r) => ({ ...r, id: `${r.id}_copy_${Date.now()}` })),
      };
      const next = [...s.questions];
      next.splice(idx + 1, 0, clone);
      return { ...s, questions: next };
    });

  const handleDeleteQuestion = (groupId: string, sectionId: string, q: Question) =>
    updateSection(groupId, sectionId, (s) => ({
      ...s,
      questions: s.questions.filter((x) => x.id !== q.id),
    }));

  const handleRequiredChange = (groupId: string, sectionId: string, q: Question, next: boolean) =>
    updateSection(groupId, sectionId, (s) => ({
      ...s,
      questions: s.questions.map((x) => (x.id === q.id ? { ...x, required: next } : x)),
    }));

  const openAddQuestion = (groupId: string, sectionId: string) =>
    setModal({ open: true, groupId, sectionId, initial: undefined });

  const openEditQuestion = (groupId: string, sectionId: string, q: Question) =>
    setModal({ open: true, groupId, sectionId, initial: q });

  const handleSaveQuestion = (
    payload: Omit<Question, "id" | "number"> & { id?: string },
    status: QuestionStatus
  ) => {
    if (!modal.groupId || !modal.sectionId) return;
    const isEdit = !!payload.id;
    updateSection(modal.groupId, modal.sectionId, (s) => {
      if (isEdit) {
        return {
          ...s,
          questions: s.questions.map((q) =>
            q.id === payload.id ? { ...q, ...payload, id: q.id, number: q.number, status } : q
          ),
        };
      }
      const newQ: Question = { ...payload, id: newQuestionId(), number: "0.0", status };
      return { ...s, questions: [...s.questions, newQ] };
    });
  };

  const handleDeleteFromModal = () => {
    if (!modal.groupId || !modal.sectionId || !modal.initial) return;
    handleDeleteQuestion(modal.groupId, modal.sectionId, modal.initial);
    setModal({ open: false, groupId: null, sectionId: null });
  };

  const noop = () => {};

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb
        crumbs={[
          { label: "Sectors", onClick: onBackToSectors },
          { label: sector.name, onClick: onBackToSector },
          { label: industry.name, onClick: onBackToIndustry },
          { label: topic.name, onClick: onBackToTopic },
          { label: subMetric.name },
        ]}
      />

      <header>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">{subMetric.name}</h2>
          {subMetric.category && (
            <span className="text-[11px] font-semibold tracking-wider text-gray-700 uppercase">
              {subMetric.category}
            </span>
          )}
        </div>
        {subMetric.description && (
          <p className="text-sm text-gray-700 mt-0.5 max-w-2xl">{subMetric.description}</p>
        )}
      </header>

      {groups.length === 0 ? (
        <section className="bg-white rounded-xl border border-gray-100 p-8 sm:p-10 flex flex-col items-center text-center">
          <p className="text-sm text-gray-700 max-w-md">
            No groups defined yet. A group maps to a backend submission key (e.g.{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded text-[11px]">
              environment.ghg.scope1.stationarySources
            </code>
            ).
          </p>
          <button
            type="button"
            onClick={() => openAddGroup()}
            className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Group
          </button>
        </section>
      ) : (
        <div className="space-y-5">
          {groups.map((group, index) => (
            <GroupBlock
              key={group.id}
              group={group}
              isFirst={index === 0}
              isLast={index === groups.length - 1}
              onAddGroupBelow={() => openAddGroup(group.id)}
              onDuplicateGroup={() => handleDuplicateGroup(group.id)}
              onEditGroup={() => openEditGroup(group.id)}
              onDeleteGroup={() => handleDeleteGroup(group.id)}
              onMoveGroupUp={() => handleMoveGroupUp(group.id)}
              onMoveGroupDown={() => handleMoveGroupDown(group.id)}
              onAddSection={() => handleAddSection(group.id)}
              onMoveSectionUp={(s) => handleMoveSectionUp(group.id, s.id)}
              onMoveSectionDown={(s) => handleMoveSectionDown(group.id, s.id)}
              onAddSectionAfter={(s) => handleAddSection(group.id, s.id)}
              onDuplicateSection={(s) => handleDuplicateSection(group.id, s.id)}
              onEditSection={noop}
              onDeleteSection={(s) => handleDeleteSection(group.id, s.id)}
              onMergeWithAbove={(s) => handleMergeWithAbove(group.id, s.id)}
              onAddQuestion={(s) => openAddQuestion(group.id, s.id)}
              onEditQuestion={(s, q) => openEditQuestion(group.id, s.id, q)}
              onDuplicateQuestion={(s, q) => handleDuplicateQuestion(group.id, s.id, q)}
              onDeleteQuestion={(s, q) => handleDeleteQuestion(group.id, s.id, q)}
              onRequiredChange={(s, q, next) => handleRequiredChange(group.id, s.id, q, next)}
              onShowResponseList={noop}
            />
          ))}
        </div>
      )}

      <QuestionEditorModal
        open={modal.open}
        onOpenChange={(next) => setModal((m) => ({ ...m, open: next }))}
        initial={modal.initial}
        contextPillarKey={pillarKey}
        contextTopicId={topic.id}
        topicOptions={topicOptions}
        onSave={handleSaveQuestion}
        onDelete={handleDeleteFromModal}
      />

      <GroupEditorModal
        open={groupModal.open}
        onOpenChange={(next) => setGroupModal((m) => ({ ...m, open: next }))}
        initial={groupModal.initial}
        siblings={groups}
        context={{
          pillarKey,
          topicName: topic.name,
          subMetricName: subMetric.name,
        }}
        onSave={handleSaveGroup}
      />
    </div>
  );
}
