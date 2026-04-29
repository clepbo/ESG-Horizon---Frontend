"use client";

import { useEffect, useState } from "react";
import Dialog from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import type { SubMetric } from "../_fixtures/types";

export interface SubMetricPayload {
  name: string;
  category: string;
  description: string;
}

interface SubMetricEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Provide for edit mode; omit for add mode. */
  initial?: SubMetric;
  onSave: (payload: SubMetricPayload) => void;
}

export default function SubMetricEditorModal({
  open,
  onOpenChange,
  initial,
  onSave,
}: SubMetricEditorModalProps) {
  const isEdit = !!initial;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setCategory(initial?.category ?? "");
    setDescription(initial?.description ?? "");
  }, [open, initial]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category: category.trim().toUpperCase(),
      description: description.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Sub-metric" : "Add Sub-metric"}
    >
      <div className="space-y-4">
        <Field label="Sub-metric Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Scope 1"
          />
        </Field>

        <div>
          <Field label="Category Tag">
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. DIRECT EMISSION"
            />
          </Field>
          <p className="text-[11px] text-gray-700 mt-1">
            Short uppercase label shown next to the sub-metric name (e.g. DIRECT EMISSION,
            PURCHASED ENERGY, VALUE CHAIN).
          </p>
        </div>

        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this sub-metric capture?"
            rows={3}
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="h-10 px-4 rounded-md bg-[#119B95] hover:bg-[#0f877f] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium"
          >
            {isEdit ? "Save Changes" : "Add Sub-metric"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
