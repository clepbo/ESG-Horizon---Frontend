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
import { useRoles } from "@/lib/roles";
import PermissionTooltip from "@/app/components/ui/PermissionTooltip";

export default function DataManagement() {
  const { canWriteData, isCompanyAdmin, isSuperAdmin } = useRoles();
  const canExport = canWriteData;
  const canDownload = canWriteData;
  const canRetention = isCompanyAdmin || isSuperAdmin;
  const canBackup = isCompanyAdmin || isSuperAdmin;
  const canSave = canRetention || canBackup;

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
        <div className="relative group">
          <button
            onClick={canExport ? handleExportAll : undefined}
            disabled={!canExport}
            className={`w-full flex flex-col items-center justify-center gap-2 border rounded py-6 ${
              canExport
                ? "border-teal-500 text-teal-500 hover:bg-teal-50 cursor-pointer"
                : "border-gray-300 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Download className="w-5 h-5" />
            <span className="text-sm font-medium">Export All Data</span>
          </button>
          {!canExport && <PermissionTooltip message="Requires Data Officer or Admin role" />}
        </div>

        {/* Download Reports */}
        <div className="relative group">
          <button
            onClick={canDownload ? handleDownloadReports : undefined}
            disabled={!canDownload}
            className={`w-full flex flex-col items-center justify-center gap-2 border rounded py-6 ${
              canDownload
                ? "border-teal-500 text-teal-500 hover:bg-teal-50 cursor-pointer"
                : "border-gray-300 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Image src="/icons/Assessment.svg" alt="File download icon" width={20} height={20} />
            <span className="text-sm font-medium">Download Reports</span>
          </button>
          {!canDownload && <PermissionTooltip message="Requires Data Officer or Admin role" />}
        </div>
      </div>

      {/* Data Retention */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <p className="font-medium">Data Retention</p>
          <p className="text-sm text-gray-500">How long to keep historical ESG data</p>
        </div>
        <div className="relative group">
          <Select
            value={retention}
            onValueChange={canRetention ? setRetention : undefined}
            disabled={!canRetention}
          >
            <SelectTrigger className={`w-[180px] ${!canRetention ? "opacity-60" : ""}`}>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Indefinite">Indefinite</SelectItem>
              <SelectItem value="1 Year">1 Year</SelectItem>
              <SelectItem value="3 Years">3 Years</SelectItem>
              <SelectItem value="5 Years">5 Years</SelectItem>
            </SelectContent>
          </Select>
          {!canRetention && <PermissionTooltip message="Only Admin can change this" align="right" />}
        </div>
      </div>

      {/* Auto-Backup */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Auto-Backup</p>
          <p className="text-sm text-gray-500">Automatically backup data to secure storage</p>
        </div>
        <div className="relative group">
          <ToggleSwitch
            checked={autoBackup}
            disabled={!canBackup}
            onChange={() => {
              if (!canBackup) return;
              setAutoBackup(!autoBackup);
              toast.info("Auto-backup feature will be available soon.");
            }}
          />
          {!canBackup && <PermissionTooltip message="Only Admin can change this" align="right" />}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-5 py-2 border border-teal-500 text-teal-500 rounded hover:bg-teal-50">
          Close
        </button>
        {canSave && (
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
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className={`inline-flex items-center ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} disabled={disabled} />
      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-teal-500 relative transition-all ${disabled ? "" : ""}`}>
        <span
          className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        ></span>
      </div>
    </label>
  );
}
