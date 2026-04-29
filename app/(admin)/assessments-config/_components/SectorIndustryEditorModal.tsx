"use client";

import { useEffect, useState } from "react";
import Dialog from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";

export interface SectorIndustryPayload {
  name: string;
  code: string;
  sasbCode: string;
  description: string;
}

type Kind = "sector" | "industry";

interface SectorIndustryEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: Kind;
  /** Provide for edit mode; omit for add mode. */
  initial?: SectorIndustryPayload;
  onSave: (payload: SectorIndustryPayload) => void;
}

const COPY: Record<
  Kind,
  {
    addTitle: string;
    editTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    codeLabel: string;
    codePlaceholder: string;
    sasbPlaceholder: string;
  }
> = {
  sector: {
    addTitle: "Add Sector",
    editTitle: "Edit Sector",
    nameLabel: "Sector Name",
    namePlaceholder: "e.g. Extractives & Minerals Processing",
    codeLabel: "Sector Code",
    codePlaceholder: "e.g. EM",
    sasbPlaceholder: "e.g. SASB-EM",
  },
  industry: {
    addTitle: "Add Industry",
    editTitle: "Edit Industry",
    nameLabel: "Industry Name",
    namePlaceholder: "e.g. Oil & Gas - Exploration & Production",
    codeLabel: "Industry Code",
    codePlaceholder: "e.g. EM-EP",
    sasbPlaceholder: "e.g. SASB-EP",
  },
};

export default function SectorIndustryEditorModal({
  open,
  onOpenChange,
  kind,
  initial,
  onSave,
}: SectorIndustryEditorModalProps) {
  const copy = COPY[kind];
  const isEdit = !!initial;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sasbCode, setSasbCode] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setCode(initial?.code ?? "");
    setSasbCode(initial?.sasbCode ?? "");
    setDescription(initial?.description ?? "");
  }, [open, initial]);

  const handleSave = () => {
    if (!name.trim() || !code.trim()) return;
    onSave({
      name: name.trim(),
      code: code.trim(),
      sasbCode: sasbCode.trim(),
      description: description.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? copy.editTitle : copy.addTitle}
    >
      <div className="space-y-4">
        <Field label={copy.nameLabel} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.namePlaceholder}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label={copy.codeLabel} required>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={copy.codePlaceholder}
            />
          </Field>
          <Field label="SASB Code">
            <Input
              value={sasbCode}
              onChange={(e) => setSasbCode(e.target.value)}
              placeholder={copy.sasbPlaceholder}
            />
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Describe what this ${kind} covers...`}
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
            disabled={!name.trim() || !code.trim()}
            className="h-10 px-4 rounded-md bg-[#119B95] hover:bg-[#0f877f] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium"
          >
            {isEdit ? "Save Changes" : `Add ${kind === "sector" ? "Sector" : "Industry"}`}
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
