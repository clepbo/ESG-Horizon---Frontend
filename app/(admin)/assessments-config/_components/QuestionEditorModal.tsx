"use client";

import { Plus, Trash2, X } from "lucide-react";
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
import Toggle from "../../components/Toggle";
import {
  PILLAR_KEYS,
  PILLAR_LABELS,
  RESPONSE_TYPES,
  RESPONSE_TYPE_LABELS,
  type NumericalSubType,
  type PillarKey,
  type Question,
  type QuestionStatus,
  type Response,
  type ResponseType,
} from "../_fixtures/types";

interface TopicOption {
  id: string;
  name: string;
  pillarKey: PillarKey;
}

interface QuestionEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing question when editing; omit when adding. */
  initial?: Question;
  /** Pre-selected pillar/topic context (the user is already drilled into one). */
  contextPillarKey: PillarKey;
  contextTopicId: string;
  /** Topic catalog so the Linked Topic select can be re-pointed. */
  topicOptions: TopicOption[];
  onSave: (next: Omit<Question, "id" | "number"> & { id?: string }, status: QuestionStatus) => void;
  onDelete?: () => void;
}

interface DraftResponse extends Omit<Response, "id"> {
  draftId: string;
}

const NUMERICAL_SUBTYPES: { value: NumericalSubType; label: string }[] = [
  { value: "integer", label: "Integer" },
  { value: "decimal", label: "Decimal" },
  { value: "percent", label: "Percent (0–100)" },
];

const TYPES_WITH_OPTIONS: ResponseType[] = ["dropdown", "multipleChoice", "checkboxes"];

let optionCounter = 0;
const newOptionId = () => `opt_${Date.now()}_${++optionCounter}`;

let draftCounter = 0;
const newDraftId = () => `r_${Date.now()}_${++draftCounter}`;

export default function QuestionEditorModal({
  open,
  onOpenChange,
  initial,
  contextPillarKey,
  contextTopicId,
  topicOptions,
  onSave,
  onDelete,
}: QuestionEditorModalProps) {
  const [text, setText] = useState("");
  const [pillarKey, setPillarKey] = useState<PillarKey>(contextPillarKey);
  const [topicId, setTopicId] = useState<string>(contextTopicId);
  const [required, setRequired] = useState(true);
  const [responses, setResponses] = useState<DraftResponse[]>([]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setText(initial.text);
      setRequired(initial.required);
      setResponses(
        initial.responses.map((r) => ({
          draftId: newDraftId(),
          type: r.type,
          title: r.title,
          helper: r.helper,
          options: r.options ? r.options.map((o) => ({ ...o })) : undefined,
          numericalSubType: r.numericalSubType,
        }))
      );
    } else {
      setText("");
      setRequired(true);
      setResponses([
        {
          draftId: newDraftId(),
          type: "multipleChoice",
          title: "",
          options: [{ id: newOptionId(), label: "" }],
        },
      ]);
    }
    setPillarKey(contextPillarKey);
    setTopicId(contextTopicId);
  }, [open, initial, contextPillarKey, contextTopicId]);

  const filteredTopics = topicOptions.filter((t) => t.pillarKey === pillarKey);

  const updateResponse = (draftId: string, patch: Partial<DraftResponse>) => {
    setResponses((prev) =>
      prev.map((r) => {
        if (r.draftId !== draftId) return r;
        const next = { ...r, ...patch };
        if (patch.type) {
          if (TYPES_WITH_OPTIONS.includes(patch.type)) {
            next.options = next.options ?? [{ id: newOptionId(), label: "" }];
            next.numericalSubType = undefined;
          } else if (patch.type === "numericalValue") {
            next.options = undefined;
            next.numericalSubType = next.numericalSubType ?? "decimal";
          } else {
            next.options = undefined;
            next.numericalSubType = undefined;
          }
        }
        return next;
      })
    );
  };

  const addResponse = () =>
    setResponses((prev) => [
      ...prev,
      { draftId: newDraftId(), type: "shortAnswer", title: "" },
    ]);

  const removeResponse = (draftId: string) =>
    setResponses((prev) => prev.filter((r) => r.draftId !== draftId));

  const addOption = (draftId: string) =>
    updateResponse(draftId, {
      options: [
        ...(responses.find((r) => r.draftId === draftId)?.options ?? []),
        { id: newOptionId(), label: "" },
      ],
    });

  const updateOption = (draftId: string, optId: string, label: string) => {
    const r = responses.find((x) => x.draftId === draftId);
    if (!r?.options) return;
    updateResponse(draftId, {
      options: r.options.map((o) => (o.id === optId ? { ...o, label } : o)),
    });
  };

  const removeOption = (draftId: string, optId: string) => {
    const r = responses.find((x) => x.draftId === draftId);
    if (!r?.options) return;
    updateResponse(draftId, {
      options: r.options.filter((o) => o.id !== optId),
    });
  };

  const buildPayload = (): Omit<Question, "id" | "number"> => ({
    text: text.trim(),
    required,
    status: "active",
    responses: responses.map((r) => ({
      id: r.draftId,
      type: r.type,
      title: r.title.trim(),
      helper: r.helper,
      options: r.options ? r.options.filter((o) => o.label.trim()).map((o) => ({ ...o })) : undefined,
      numericalSubType: r.numericalSubType,
    })),
  });

  const handleSave = (status: QuestionStatus) => {
    const payload = buildPayload();
    onSave({ ...payload, id: initial?.id, status }, status);
    onOpenChange(false);
  };

  const isEdit = !!initial;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add / Edit Question" className="max-w-3xl">
      <div className="space-y-5">
        {/* Question Text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Question Text" required>
            <Textarea
              placeholder="Enter your question here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
          </Field>

          <div className="space-y-4">
            <Field label="Linked Pillar" required>
              <Select value={pillarKey} onValueChange={(v) => setPillarKey(v as PillarKey)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pillar" />
                </SelectTrigger>
                <SelectContent>
                  {PILLAR_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {PILLAR_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Linked Topic / Sub-topic" required>
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTopics.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-gray-700">No topics for this pillar.</div>
                  ) : (
                    filteredTopics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Toggle checked={required} onChange={setRequired} ariaLabel="Toggle required" />
          <span className="text-sm text-gray-700">Required</span>
        </div>

        {/* Responses */}
        <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Response *</h3>
            <button
              type="button"
              onClick={addResponse}
              className="inline-flex items-center gap-1 px-3 h-8 rounded-md border border-gray-200 bg-white text-xs font-medium text-gray-800 hover:bg-gray-50"
            >
              <Plus className="w-3.5 h-3.5" /> Add More Response
            </button>
          </div>

          <div className="space-y-4">
            {responses.map((r) => (
              <div key={r.draftId} className="bg-white rounded-md border border-gray-100 p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Response Type" required>
                    <Select
                      value={r.type}
                      onValueChange={(v) => updateResponse(r.draftId, { type: v as ResponseType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESPONSE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {RESPONSE_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Response Title">
                    <Input
                      placeholder="Write a title for the response"
                      value={r.title}
                      onChange={(e) => updateResponse(r.draftId, { title: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Helper text/placeholder/description (optional)">
                    <Input
                      placeholder="Write a description for the response"
                      value={r.helper ?? ""}
                      onChange={(e) => updateResponse(r.draftId, { helper: e.target.value })}
                    />
                  </Field>

                  {r.type === "numericalValue" && (
                    <Field label="Numerical Type" required>
                      <Select
                        value={r.numericalSubType ?? "decimal"}
                        onValueChange={(v) =>
                          updateResponse(r.draftId, { numericalSubType: v as NumericalSubType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select numerical type" />
                        </SelectTrigger>
                        <SelectContent>
                          {NUMERICAL_SUBTYPES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}

                  {TYPES_WITH_OPTIONS.includes(r.type) && (
                    <Field label="Response Options">
                      <div className="space-y-2">
                        {(r.options ?? []).map((opt) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <Input
                              placeholder="Enter option here"
                              value={opt.label}
                              onChange={(e) => updateOption(r.draftId, opt.id, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(r.draftId, opt.id)}
                              className="w-7 h-7 inline-flex items-center justify-center rounded text-red-500 hover:bg-red-50"
                              aria-label="Remove option"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => addOption(r.draftId)}
                            className="inline-flex items-center gap-1 text-[#119B95] hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Add option
                          </button>
                          <span className="text-gray-500">or</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateResponse(r.draftId, {
                                options: [
                                  ...(r.options ?? []),
                                  { id: newOptionId(), label: "Other" },
                                ],
                              })
                            }
                            className="text-[#119B95] hover:underline"
                          >
                            add &quot;Other&quot;
                          </button>
                        </div>
                      </div>
                    </Field>
                  )}
                </div>

                {responses.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeResponse(r.draftId)}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove response
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </button>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="h-10 px-4 rounded-md border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete Rule
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave("draft")}
              className="h-10 px-4 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave("active")}
              className="h-10 px-4 rounded-md bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
            >
              Save & Activate
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
