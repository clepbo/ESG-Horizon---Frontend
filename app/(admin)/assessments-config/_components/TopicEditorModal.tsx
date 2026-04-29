"use client";

import { useEffect, useState } from "react";
import Dialog from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { PILLAR_LABELS, type Industry, type PillarKey, type Topic } from "../_fixtures/types";

export interface NewTopicPayload {
  name: string;
  description: string;
  ifrsCode: string;
  formCountLabel?: string;
  pillarKey: PillarKey;
  status: "draft" | "active";
}

interface TopicEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  industry: Industry;
  /** Pre-selected pillar (optional). Defaults to the first pillar in the industry. */
  defaultPillarKey?: PillarKey;
  /** When provided, the modal acts in edit mode. */
  initial?: Topic;
  onSave: (payload: NewTopicPayload, initialId?: string) => void;
}

export default function TopicEditorModal({
  open,
  onOpenChange,
  industry,
  defaultPillarKey,
  initial,
  onSave,
}: TopicEditorModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ifrsCode, setIfrsCode] = useState("");
  const [formCountLabel, setFormCountLabel] = useState("");
  const [pillarKey, setPillarKey] = useState<PillarKey>(
    defaultPillarKey ?? industry.pillars[0]?.key ?? "environmental"
  );

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setDescription(initial.description);
      setIfrsCode(initial.ifrsCode);
      setFormCountLabel(initial.formCountLabel ?? "");
      const owningPillar = industry.pillars.find((p) =>
        p.topics.some((t) => t.id === initial.id)
      );
      setPillarKey(owningPillar?.key ?? defaultPillarKey ?? "environmental");
    } else {
      setName("");
      setDescription("");
      setIfrsCode("");
      setFormCountLabel("");
      setPillarKey(defaultPillarKey ?? industry.pillars[0]?.key ?? "environmental");
    }
  }, [open, initial, industry, defaultPillarKey]);

  const submit = (status: "draft" | "active") => {
    if (!name.trim() || !pillarKey) return;
    onSave(
      {
        name: name.trim(),
        description: description.trim(),
        ifrsCode: ifrsCode.trim(),
        formCountLabel: formCountLabel.trim() || undefined,
        pillarKey,
        status,
      },
      initial?.id
    );
    onOpenChange(false);
  };

  const isEdit = !!initial;
  const pillarOptions = industry.pillars.map((p) => p.key);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Disclosure Topic" : "Add Disclosure Topic"}
    >
      <div className="space-y-4">
        <Field label="Topic Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Greenhouse Gas Emissions"
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this topic cover?"
            rows={3}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Linked Pillar" required>
            <Select value={pillarKey} onValueChange={(v) => setPillarKey(v as PillarKey)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pillar" />
              </SelectTrigger>
              <SelectContent>
                {pillarOptions.map((k) => (
                  <SelectItem key={k} value={k}>
                    {PILLAR_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="IFRS / SASB Code">
            <Input
              value={ifrsCode}
              onChange={(e) => setIfrsCode(e.target.value)}
              placeholder="e.g. IFRS: EM-EP-110a"
            />
          </Field>
        </div>

        <Field label="Form count label (optional)">
          <Input
            value={formCountLabel}
            onChange={(e) => setFormCountLabel(e.target.value)}
            placeholder="e.g. 4 form"
          />
        </Field>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => submit("draft")}
              disabled={!name.trim()}
              className="h-10 px-4 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => submit("active")}
              disabled={!name.trim()}
              className="h-10 px-4 rounded-md bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEdit ? "Save & Activate" : "Add Topic"}
            </button>
          </div>
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
