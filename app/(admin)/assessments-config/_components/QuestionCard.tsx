"use client";

import { Copy, ListIcon, Pencil, Plus, Trash2 } from "lucide-react";
import Toggle from "../../components/Toggle";
import { RESPONSE_TYPE_LABELS, type Question } from "../_fixtures/types";

interface QuestionCardProps {
  question: Question;
  onAddNext: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onShowList: () => void;
  onDelete: () => void;
  onRequiredChange: (next: boolean) => void;
}

export default function QuestionCard({
  question,
  onAddNext,
  onDuplicate,
  onEdit,
  onShowList,
  onDelete,
  onRequiredChange,
}: QuestionCardProps) {
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="p-4">
          <p className="text-[10px] font-semibold tracking-wider text-gray-600 uppercase">
            Question
          </p>
          <p className="text-sm font-medium text-gray-900 mt-2 leading-relaxed">
            {question.number} {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </p>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-semibold tracking-wider text-gray-600 uppercase">
            Response
          </p>
          <ul className="mt-2 space-y-2">
            {question.responses.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3">
                <span className="text-sm text-gray-900 leading-snug flex-1">{r.title}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 shrink-0">
                  {RESPONSE_TYPE_LABELS[r.type]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between bg-gray-50/40">
        <div className="flex items-center gap-1 text-gray-600">
          <IconButton onClick={onAddNext} label="Add question after this">
            <Plus className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={onDuplicate} label="Duplicate question">
            <Copy className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={onEdit} label="Edit question">
            <Pencil className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={onShowList} label="Show response list">
            <ListIcon className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={onDelete} label="Delete question" tone="danger">
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-700">Required</span>
          <Toggle
            checked={question.required}
            onChange={onRequiredChange}
            ariaLabel="Toggle required"
          />
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
  tone = "neutral",
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-7 h-7 inline-flex items-center justify-center rounded hover:bg-gray-100 transition-colors ${
        tone === "danger" ? "text-red-500 hover:text-red-600" : "text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
