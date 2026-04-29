"use client";

import { useEffect, useMemo, useState } from "react";
import Dialog from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import type { Group, PillarKey } from "../_fixtures/types";

export interface GroupPayload {
  name: string;
  description: string;
  groupKey: string;
}

interface GroupEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Provide for edit mode; omit for add mode. */
  initial?: Group;
  /** Sibling groups in the same sub-metric — used to infer prefix + check uniqueness. */
  siblings: Group[];
  /** Current breadcrumb context, used to build a fallback prefix when there are no siblings. */
  context: {
    pillarKey: PillarKey;
    topicName: string;
    subMetricName: string;
  };
  onSave: (payload: GroupPayload) => void;
}

/* ---------- groupKey helpers (kept local to this module) ---------- */

/** "Stationary Sources" → "stationarySources" — matches the platform's existing key style. */
function toCamel(s: string): string {
  const cleaned = s.replace(/[^a-zA-Z0-9 &-]/g, " ").trim();
  if (!cleaned) return "";
  return cleaned
    .split(/\s+|-|&/)
    .filter(Boolean)
    .map((w, i) =>
      i === 0
        ? w.charAt(0).toLowerCase() + w.slice(1).toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join("");
}

/** Longest dot-segmented prefix shared by every sibling key (returns trailing dot, or "" if none). */
function commonDottedPrefix(keys: string[]): string {
  if (keys.length === 0) return "";
  const segs = keys[0].split(".");
  let prefix = "";
  for (let depth = 0; depth < segs.length; depth++) {
    const candidate = segs.slice(0, depth + 1).join(".") + ".";
    if (keys.every((k) => k.startsWith(candidate))) {
      prefix = candidate;
    } else {
      break;
    }
  }
  return prefix;
}

const PILLAR_SEGMENT: Record<PillarKey, string> = {
  environmental: "environment",
  socialCapital: "socialCapital",
  humanCapital: "humanCapital",
  businessModel: "businessModel",
  leadershipGovernance: "leadershipGovernance",
};

const TOPIC_SHORTHAND: Record<string, string> = {
  "greenhouse gas emissions": "ghg",
};

const SUBMETRIC_SHORTHAND: Record<string, string> = {
  "scope 1": "scope1",
  "scope 2": "scope2",
  "scope 3": "scope3",
};

function compactSegment(name: string, table: Record<string, string>): string {
  const lower = name.trim().toLowerCase();
  return table[lower] ?? toCamel(name);
}

function fallbackPrefix(ctx: GroupEditorModalProps["context"]): string {
  const segs = [
    PILLAR_SEGMENT[ctx.pillarKey],
    compactSegment(ctx.topicName, TOPIC_SHORTHAND),
    compactSegment(ctx.subMetricName, SUBMETRIC_SHORTHAND),
  ].filter(Boolean);
  return segs.length ? `${segs.join(".")}.` : "";
}

/* ---------- Component ---------- */

export default function GroupEditorModal({
  open,
  onOpenChange,
  initial,
  siblings,
  context,
  onSave,
}: GroupEditorModalProps) {
  const siblingKeys = useMemo(
    () =>
      siblings
        .filter((g) => g.id !== initial?.id)
        .map((g) => g.groupKey)
        .filter((k): k is string => !!k),
    [siblings, initial]
  );

  const inferredPrefix = useMemo(
    () => commonDottedPrefix(siblingKeys) || fallbackPrefix(context),
    [siblingKeys, context]
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupKey, setGroupKey] = useState("");
  const [keyAutoLinked, setKeyAutoLinked] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? "");
      setGroupKey(initial.groupKey ?? "");
      setKeyAutoLinked(false);
    } else {
      setName("");
      setDescription("");
      setGroupKey("");
      setKeyAutoLinked(true);
    }
  }, [open, initial]);

  // Auto-fill groupKey while user types name (until they manually edit it).
  useEffect(() => {
    if (!keyAutoLinked) return;
    setGroupKey(name ? `${inferredPrefix}${toCamel(name)}` : "");
  }, [name, inferredPrefix, keyAutoLinked]);

  const isDuplicate = !!groupKey && siblingKeys.includes(groupKey);
  const canSave = name.trim() && groupKey.trim() && !isDuplicate;
  const isEdit = !!initial;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      groupKey: groupKey.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Group" : "Add Group"}
    >
      <div className="space-y-4">
        <Field label="Group Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Stationary Sources"
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What kind of emissions or activity does this group cover?"
            rows={3}
          />
        </Field>

        <div>
          <Field label="Group Key" required>
            <Input
              value={groupKey}
              onChange={(e) => {
                setKeyAutoLinked(false);
                setGroupKey(e.target.value);
              }}
              placeholder="e.g. environment.ghg.scope1.stationarySources"
              className={isDuplicate ? "border-red-500" : ""}
            />
          </Field>
          <p className="text-[11px] text-gray-700 mt-1 leading-relaxed">
            Used by the platform to track submitted forms. Matches the path under{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">
              assessment.assessmentData
            </code>{" "}
            (e.g.{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">
              environment.ghg.scope1.stationarySources
            </code>
            ).
            {keyAutoLinked && " Auto-derived from the name — edit to override."}
          </p>
          {isDuplicate && (
            <p className="text-[11px] text-red-600 mt-1">
              A sibling group already uses this key. Choose a different one.
            </p>
          )}
        </div>

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
            disabled={!canSave}
            className="h-10 px-4 rounded-md bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? "Save Changes" : "Add Group"}
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
