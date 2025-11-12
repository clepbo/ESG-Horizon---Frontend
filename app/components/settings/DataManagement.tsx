"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Download } from "lucide-react";

export default function DataManagement() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [retention, setRetention] = useState("Indefinite");
  const [saving, setSaving] = useState(false);

  const handleExportAll = () => {
    toast.info("Export feature will be available soon.");
  };

  const handleDownloadReports = () => {
    toast.info("Report download requires a subscription.");
  };

  const handleSave = async () => {
    setSaving(true);
    // simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Settings saved (settings will take effect soon).");
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Data Management</h2>
      <p className="text-gray-600">Export your data and manage retention policies</p>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export All Data */}
        <button
          onClick={handleExportAll}
          className="flex flex-col items-center justify-center gap-2 border border-teal-500 text-teal-500 rounded hover:bg-teal-50 py-6 cursor-pointer"
          title="Feature will be available soon"
        >
          <Download className="w-5 h-5" />
          <span className="text-sm font-medium">Export All Data</span>
        </button>

        {/* Download Reports */}
        <button
          onClick={handleDownloadReports}
          className="flex flex-col items-center justify-center gap-2 border border-teal-500 text-teal-500 rounded hover:bg-teal-50 py-6 cursor-pointer"
          title="Requires subscription"
        >
          <Image src="/icons/Assessment.svg" alt="File download icon" width={20} height={20} />
          <span className="text-sm font-medium">Download Reports</span>
        </button>
      </div>

      {/* Data Retention */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <p className="font-medium">Data Retention</p>
          <p className="text-sm text-gray-500">How long to keep historical ESG data</p>
        </div>
        <div title="Retention policy feature requires subscription">
          <Select value={retention} onValueChange={setRetention}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Indefinite">Indefinite</SelectItem>
              <SelectItem value="1 Year">1 Year</SelectItem>
              <SelectItem value="3 Years">3 Years</SelectItem>
              <SelectItem value="5 Years">5 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Auto-Backup */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Auto-Backup</p>
          <p className="text-sm text-gray-500">Automatically backup data to secure storage</p>
        </div>
        <ToggleSwitch
          checked={autoBackup}
          onChange={() => {
            setAutoBackup(!autoBackup);
            toast.info("Auto-backup feature will be available soon.");
          }}
          title="Feature will be available soon"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-5 py-2 border border-teal-500 text-teal-500 rounded hover:bg-teal-50">
          Close
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2 rounded text-white cursor-pointer ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[var(--color-primary)] hover:bg-teal-600"
          }`}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  title,
}: {
  checked: boolean;
  onChange: () => void;
  title?: string;
}) {
  return (
    <label className="inline-flex items-center cursor-pointer" title={title}>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-teal-500 relative transition-all">
        <span
          className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        ></span>
      </div>
    </label>
  );
}
