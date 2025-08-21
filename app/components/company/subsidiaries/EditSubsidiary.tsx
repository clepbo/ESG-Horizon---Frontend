"use client";

import { useState } from "react";
import BackButton from "../../ui/reusables/BackButton";
import {
  subsidiariesService,
  Subsidiary,
} from "@/services/subsidiaries.service";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Button } from "../../ui/button";

export default function EditSubsidiaryModal({
  subsidiary,
  onClose,
  onUpdate,
}: {
  subsidiary: Subsidiary;
  onClose: () => void;
  onUpdate?: (updated: Subsidiary) => void;
}) {
  const [formData, setFormData] = useState<Subsidiary>(subsidiary);

  const handleChange = (field: keyof Subsidiary, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    subsidiariesService.editSubsidiaries({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = () => {
    onUpdate?.(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-lg">
        <BackButton />

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Edit Subsidiary
        </h2>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label>Subsidiary Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Subsidiary Name"
            />
          </div>

          <div>
            <Label>Sector *</Label>
            <Select
              value={formData.sector}
              onValueChange={(v) => handleChange("sector", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Extractives and Minerals Processing">
                  Extractives and Minerals Processing
                </SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Industry *</Label>
            <Select
              value={formData.industry}
              onValueChange={(v) => handleChange("industry", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oil & Gas – Exploration & Production">
                  Oil & Gas – Exploration & Production
                </SelectItem>
                <SelectItem value="Oil & Gas – Services">
                  Oil & Gas – Services
                </SelectItem>
                <SelectItem value="Renewable Energy">
                  Renewable Energy
                </SelectItem>
                <SelectItem value="Mining">Mining</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Address *</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
