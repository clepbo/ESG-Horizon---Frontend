"use client";

import { ChevronDown, ChevronUp, MoreVertical, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import QuestionCard from "./QuestionCard";
import type { Question, Section } from "../_fixtures/types";

interface SectionCardProps {
  section: Section;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddSectionAfter: () => void;
  onDuplicateSection: () => void;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onMergeWithAbove: () => void;
  onAddQuestion: () => void;
  onEditQuestion: (q: Question) => void;
  onDuplicateQuestion: (q: Question) => void;
  onDeleteQuestion: (q: Question) => void;
  onRequiredChange: (q: Question, next: boolean) => void;
  onShowResponseList: (q: Question) => void;
}

export default function SectionCard({
  section,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
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
}: SectionCardProps) {
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden bg-white">
      <div className="px-4 py-3 flex items-start justify-between gap-3 bg-white border-b border-gray-100">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wider text-gray-600 uppercase">
            Section {index + 1}
          </p>
          <h4 className="text-sm font-semibold text-gray-900 mt-1">{section.name}</h4>
          {section.description && (
            <p className="text-xs text-gray-700 mt-1 leading-relaxed">{section.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="w-7 h-7 inline-flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move section up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="w-7 h-7 inline-flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move section down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-7 h-7 inline-flex items-center justify-center rounded text-gray-700 hover:bg-gray-100"
                aria-label="Section options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onAddSectionAfter}>Add Section</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicateSection}>Duplicate Section</DropdownMenuItem>
              <DropdownMenuItem onClick={onEditSection}>Edit Section</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onMoveUp} disabled={isFirst}>
                Move up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMoveDown} disabled={isLast}>
                Move down
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMergeWithAbove} disabled={isFirst}>
                Merge with above
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onAddQuestion}>Add Question</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDeleteSection}
                className="text-red-600 focus:text-red-600"
              >
                Delete Section
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {section.questions.length === 0 ? (
          <p className="text-xs text-gray-700">No questions in this section yet.</p>
        ) : (
          section.questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onAddNext={onAddQuestion}
              onDuplicate={() => onDuplicateQuestion(q)}
              onEdit={() => onEditQuestion(q)}
              onShowList={() => onShowResponseList(q)}
              onDelete={() => onDeleteQuestion(q)}
              onRequiredChange={(next) => onRequiredChange(q, next)}
            />
          ))
        )}

        <button
          type="button"
          onClick={onAddQuestion}
          className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md border border-dashed border-gray-300 text-sm text-gray-700 hover:border-[#119B95]/50 hover:text-[#119B95] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>
    </div>
  );
}
