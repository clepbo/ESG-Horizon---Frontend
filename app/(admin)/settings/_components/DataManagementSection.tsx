"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import Toggle from "../../components/Toggle";
import SettingsCard from "./SettingsCard";

const RETENTION_OPTIONS = ["Indefinite", "7 years", "5 years", "3 years", "1 year"];

export default function DataManagementSection() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [retention, setRetention] = useState("Indefinite");

  return (
    <SettingsCard title="Data Management">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Auto-backup</p>
            <p className="text-xs text-gray-700 mt-0.5">Daily backup to secure storage</p>
          </div>
          <Toggle checked={autoBackup} onChange={setAutoBackup} ariaLabel="Auto-backup" />
        </div>

        <div>
          <label className="block text-sm text-gray-800 mb-1.5">Data Retention Period</label>
          <Select value={retention} onValueChange={setRetention}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RETENTION_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Export All Data
          </button>
          <button
            type="button"
            className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Download Reports
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}
