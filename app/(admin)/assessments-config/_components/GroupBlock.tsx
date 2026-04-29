"use client";

import { ChevronDown, ChevronUp, MoreVertical, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import SectionCard from "./SectionCard";
import type { Group, Question, Section } from "../_fixtures/types";

interface GroupBlockProps {
  group: Group;
  isFirst: boolean;
  isLast: boolean;
  onAddGroupBelow: () => void;
  onDuplicateGroup: () => void;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  onMoveGroupUp: () => void;
  onMoveGroupDown: () => void;
  onAddSection: () => void;
  onMoveSectionUp: (s: Section, index: number) => void;
  onMoveSectionDown: (s: Section, index: number) => void;
  onAddSectionAfter: (s: Section, index: number) => void;
  onDuplicateSection: (s: Section) => void;
  onEditSection: (s: Section) => void;
  onDeleteSection: (s: Section) => void;
  onMergeWithAbove: (s: Section, index: number) => void;
  onAddQuestion: (s: Section) => void;
  onEditQuestion: (s: Section, q: Question) => void;
  onDuplicateQuestion: (s: Section, q: Question) => void;
  onDeleteQuestion: (s: Section, q: Question) => void;
  onRequiredChange: (s: Section, q: Question, next: boolean) => void;
  onShowResponseList: (s: Section, q: Question) => void;
}

export default function GroupBlock({
  group,
  isFirst,
  isLast,
  onAddGroupBelow,
  onDuplicateGroup,
  onEditGroup,
  onDeleteGroup,
  onMoveGroupUp,
  onMoveGroupDown,
  onAddSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onAddSectionAfter,
  onDuplicateSection,
  onEditSection,
  onDeleteSection,
  onMergeWithAbove,
  onAddQuestion,
  onEditQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onRequiredChange,
  onShowResponseList,
}: GroupBlockProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-900 text-white px-4 py-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{group.name}</h3>
          {group.description && (
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{group.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveGroupUp}
            disabled={isFirst}
            className="w-7 h-7 inline-flex items-center justify-center rounded text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move group up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveGroupDown}
            disabled={isLast}
            className="w-7 h-7 inline-flex items-center justify-center rounded text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move group down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-7 h-7 inline-flex items-center justify-center rounded text-gray-300 hover:bg-white/10"
                aria-label="Group options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onAddGroupBelow}>Add Group below</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicateGroup}>Duplicate Group</DropdownMenuItem>
              <DropdownMenuItem onClick={onEditGroup}>Edit Group</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onMoveGroupUp} disabled={isFirst}>
                Move up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMoveGroupDown} disabled={isLast}>
                Move down
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDeleteGroup}
                className="text-red-600 focus:text-red-600"
              >
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="bg-white p-4 space-y-4">
        {group.sections.length === 0 ? (
          <p className="text-sm text-gray-700">
            No sections defined yet. Add a section to start building this group.
          </p>
        ) : (
          group.sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              isFirst={index === 0}
              isLast={index === group.sections.length - 1}
              onMoveUp={() => onMoveSectionUp(section, index)}
              onMoveDown={() => onMoveSectionDown(section, index)}
              onAddSectionAfter={() => onAddSectionAfter(section, index)}
              onDuplicateSection={() => onDuplicateSection(section)}
              onEditSection={() => onEditSection(section)}
              onDeleteSection={() => onDeleteSection(section)}
              onMergeWithAbove={() => onMergeWithAbove(section, index)}
              onAddQuestion={() => onAddQuestion(section)}
              onEditQuestion={(q) => onEditQuestion(section, q)}
              onDuplicateQuestion={(q) => onDuplicateQuestion(section, q)}
              onDeleteQuestion={(q) => onDeleteQuestion(section, q)}
              onRequiredChange={(q, next) => onRequiredChange(section, q, next)}
              onShowResponseList={(q) => onShowResponseList(section, q)}
            />
          ))
        )}

        <button
          type="button"
          onClick={onAddSection}
          className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md border border-dashed border-gray-300 text-sm text-gray-700 hover:border-[#119B95]/50 hover:text-[#119B95] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>
    </div>
  );
}
