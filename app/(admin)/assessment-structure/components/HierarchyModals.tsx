"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { adminDisclosureService } from "@/services/adminDisclosure.service";
import { toast } from "react-toastify";

// ── Shared Props ─────────────────────────────────────────────────────────────

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId?: number;
  initialData?: any;
}

// ── Pillar Modal ─────────────────────────────────────────────────────────────

export function PillarModal({ isOpen, onClose, onSuccess, parentId, initialData }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    sortOrder: 0,
    industryId: parentId || 0,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData(prev => ({ ...prev, industryId: parentId || 0 }));
  }, [initialData, parentId]);

  const handleSubmit = async () => {
    try {
      if (initialData) {
        await adminDisclosureService.updatePillar(initialData.id, formData);
        toast.success("Pillar updated");
      } else {
        await adminDisclosureService.createPillar(formData);
        toast.success("Pillar created and linked to industry");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save pillar");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Pillar" : "Add Pillar"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Environmental" />
          </div>
          <div className="grid gap-2">
            <Label>Code</Label>
            <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. ENV" />
          </div>
          <div className="flex items-center gap-4">
             <div className="grid gap-2 flex-1">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: +e.target.value })} />
             </div>
             <div className="flex items-center space-x-2 pt-6">
                <Checkbox id="pillar-active" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })} />
                <Label htmlFor="pillar-active">Active</Label>
             </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-emerald-600" onClick={handleSubmit}>Save Pillar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Topic Modal ──────────────────────────────────────────────────────────────

export function TopicModal({ isOpen, onClose, onSuccess, parentId, initialData }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sortOrder: 0,
    industryId: parentId || 0,
    pillarId: 0,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData(prev => ({ ...prev, industryId: parentId || 0 }));
  }, [initialData, parentId]);

  const handleSubmit = async () => {
    try {
      if (initialData) {
        await adminDisclosureService.updateTopic(initialData.id, formData);
        toast.success("Topic updated");
      } else {
        await adminDisclosureService.createTopic(formData);
        toast.success("Topic created");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save topic");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Topic" : "Add Topic"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="flex items-center gap-4">
             <div className="grid gap-2 flex-1">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: +e.target.value })} />
             </div>
             <div className="flex items-center space-x-2 pt-6">
                <Checkbox id="topic-active" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })} />
                <Label htmlFor="topic-active">Active</Label>
             </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-emerald-600" onClick={handleSubmit}>Save Topic</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Subtopic Modal ──────────────────────────────────────────────────────────

export function SubtopicModal({ isOpen, onClose, onSuccess, parentId, initialData }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sortOrder: 0,
    topicId: parentId || 0,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData(prev => ({ ...prev, topicId: parentId || 0 }));
  }, [initialData, parentId]);

  const handleSubmit = async () => {
    try {
      if (initialData) {
        await adminDisclosureService.updateSubtopic(initialData.id, formData);
        toast.success("Subtopic updated");
      } else {
        await adminDisclosureService.createSubtopic(formData);
        toast.success("Subtopic created");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save subtopic");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Subtopic" : "Add Subtopic"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="flex items-center gap-4">
             <div className="grid gap-2 flex-1">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: +e.target.value })} />
             </div>
             <div className="flex items-center space-x-2 pt-6">
                <Checkbox id="subtopic-active" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })} />
                <Label htmlFor="subtopic-active">Active</Label>
             </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-emerald-600" onClick={handleSubmit}>Save Subtopic</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Metric Modal ─────────────────────────────────────────────────────────────

export function MetricModal({ isOpen, onClose, onSuccess, parentId, initialData }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sortOrder: 0,
    subtopicId: parentId || 0,
    topicId: 0,
    isActive: true,
  });

  const [parentType, setParentType] = useState<"subtopic" | "topic">("subtopic");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setParentType(initialData.topicId ? "topic" : "subtopic");
    } else {
      setFormData(prev => ({ ...prev, subtopicId: parentId || 0 }));
    }
  }, [initialData, parentId]);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        subtopicId: parentType === "subtopic" ? formData.subtopicId : undefined,
        topicId: parentType === "topic" ? formData.topicId : undefined,
      };

      if (initialData) {
        await adminDisclosureService.updateMetric(initialData.id, payload);
        toast.success("Metric updated");
      } else {
        await adminDisclosureService.createMetric(payload);
        toast.success("Metric created");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save metric");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Metric" : "Add Metric"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          
          {!initialData && (
            <div className="grid gap-2">
              <Label>Attach to</Label>
              <Select value={parentType} onValueChange={(v: any) => setParentType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subtopic">Subtopic</SelectItem>
                  <SelectItem value="topic">Topic (Skip Subtopic level)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-4">
             <div className="grid gap-2 flex-1">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: +e.target.value })} />
             </div>
             <div className="flex items-center space-x-2 pt-6">
                <Checkbox id="metric-active" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })} />
                <Label htmlFor="metric-active">Active</Label>
             </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-emerald-600" onClick={handleSubmit}>Save Metric</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Submetric Modal ──────────────────────────────────────────────────────────

export function SubmetricModal({ isOpen, onClose, onSuccess, parentId, initialData }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sortOrder: 0,
    metricId: parentId || 0,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData(prev => ({ ...prev, metricId: parentId || 0 }));
  }, [initialData, parentId]);

  const handleSubmit = async () => {
    try {
      if (initialData) {
        await adminDisclosureService.updateSubmetric(initialData.id, formData);
        toast.success("Submetric updated");
      } else {
        await adminDisclosureService.createSubmetric(formData);
        toast.success("Submetric created");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save submetric");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Submetric" : "Add Submetric"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="flex items-center gap-4">
             <div className="grid gap-2 flex-1">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: +e.target.value })} />
             </div>
             <div className="flex items-center space-x-2 pt-6">
                <Checkbox id="submetric-active" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })} />
                <Label htmlFor="submetric-active">Active</Label>
             </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-emerald-600" onClick={handleSubmit}>Save Submetric</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Submetric Detail Modal (The most complex one) ────────────────────────────

export function DetailModal({ isOpen, onClose, onSuccess, parentId, initialData }: BaseModalProps) {
  const [formData, setFormData] = useState({
    label: "",
    type: "number",
    placeholder: "",
    helpText: "",
    isRequired: false,
    unit: "",
    unitOptions: [] as string[],
    sortOrder: 0,
    submetricId: parentId || 0,
    isActive: true,
    mappingKey: "",
    emissionFactor: null as any,
  });

  const [unitOptionInput, setUnitOptionInput] = useState("");

  const inputTypes = [
    { label: "Number", value: "number" },
    { label: "Text", value: "text" },
    { label: "Select (Dropdown)", value: "select" },
    { label: "Radio Group", value: "radio" },
    { label: "Boolean (Yes/No)", value: "boolean" },
    { label: "Date", value: "date" },
    { label: "File Upload (Simple)", value: "file" },
    { label: "File Upload (with URL)", value: "file_url" },
    { label: "3-Field Input (Type/Value/Unit)", value: "triple_input" },
    { label: "Number with Unit", value: "number_unit" },
  ];

  useEffect(() => {
    if (initialData) setFormData({ ...initialData, unitOptions: initialData.unitOptions || [] });
    else setFormData(prev => ({ ...prev, submetricId: parentId || 0 }));
  }, [initialData, parentId]);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        inputType: formData.type.toUpperCase(), // Map to enum
      };
      
      if (initialData) {
        await adminDisclosureService.updateSubmetricDetail(initialData.id, payload);
        toast.success("Field updated");
      } else {
        await adminDisclosureService.createSubmetricDetail(payload);
        toast.success("Field created");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save field");
    }
  };

  const addUnitOption = () => {
    if (unitOptionInput && !formData.unitOptions.includes(unitOptionInput)) {
      setFormData({ ...formData, unitOptions: [...formData.unitOptions, unitOptionInput] });
      setUnitOptionInput("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Field" : "Add Field"}</DialogTitle>
          <DialogDescription>Define a new input field for the assessment collection.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label>Label</Label>
            <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="e.g. Total Consumption" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inputTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Unit (Optional)</Label>
              <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="kWh, tCO2e..." />
            </div>
          </div>

          {(formData.type === 'select' || formData.type === 'radio') && (
            <div className="grid gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
               <Label className="text-[10px] uppercase font-bold text-neutral-500">Unit Options / Choices</Label>
               <div className="flex gap-2">
                 <Input value={unitOptionInput} onChange={(e) => setUnitOptionInput(e.target.value)} placeholder="Option name..." className="h-8 text-xs" />
                 <Button size="xs" variant="secondary" onClick={addUnitOption}>Add</Button>
               </div>
               <div className="flex flex-wrap gap-1 mt-2">
                 {formData.unitOptions.map((opt, i) => (
                   <div key={i} className="px-2 py-1 bg-white border rounded text-[10px] flex items-center gap-1">
                     {opt}
                     <button className="text-red-400" onClick={() => setFormData({...formData, unitOptions: formData.unitOptions.filter(o => o !== opt)})}>×</button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {formData.type === 'triple_input' && (
            <div className="grid gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
               <Label className="text-[10px] uppercase font-bold text-blue-500 italic"> GHG / Triple Input Support</Label>
               <p className="text-[10px] text-blue-400">This field will automatically include Type, Volume, and Unit selectors.</p>
               <div className="grid gap-2 mt-2">
                  <Label className="text-[9px]">Default Mapping / Emission Key</Label>
                  <Input value={formData.mappingKey} onChange={(e) => setFormData({ ...formData, mappingKey: e.target.value })} placeholder="e.g. diesel_gen_factor" className="h-7 text-xs" />
               </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
                <Label>Mapping Key</Label>
                <Input value={formData.mappingKey} onChange={(e) => setFormData({ ...formData, mappingKey: e.target.value })} placeholder="Integration key..." />
             </div>
             <div className="grid gap-2">
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: +e.target.value })} />
             </div>
          </div>

          <div className="grid gap-2">
            <Label>Help Text (Optional)</Label>
            <Textarea value={formData.helpText} onChange={(e) => setFormData({ ...formData, helpText: e.target.value })} className="h-20" />
          </div>

          <div className="flex items-center space-x-2">
             <Checkbox id="detail-required" checked={formData.isRequired} onCheckedChange={(checked) => setFormData({ ...formData, isRequired: !!checked })} />
             <Label htmlFor="detail-required">This field is mandatory</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-emerald-600" onClick={handleSubmit}>Save Field</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
