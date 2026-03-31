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
    isActive: true,
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData(prev => ({ ...prev, subtopicId: parentId || 0 }));
  }, [initialData, parentId]);

  const handleSubmit = async () => {
    try {
      if (initialData) {
        await adminDisclosureService.updateMetric(initialData.id, formData);
        toast.success("Metric updated");
      } else {
        await adminDisclosureService.createMetric(formData);
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
  });

  const [unitOptionInput, setUnitOptionInput] = useState("");

  useEffect(() => {
    if (initialData) setFormData({ ...initialData, unitOptions: initialData.unitOptions || [] });
    else setFormData(prev => ({ ...prev, submetricId: parentId || 0 }));
  }, [initialData, parentId]);

  const handleSubmit = async () => {
    try {
      if (initialData) {
        await adminDisclosureService.updateSubmetricDetail(initialData.id, formData);
        toast.success("Field updated");
      } else {
        await adminDisclosureService.createSubmetricDetail(formData);
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
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="boolean">Yes/No</SelectItem>
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
