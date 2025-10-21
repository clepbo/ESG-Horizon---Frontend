/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import {
  useApproveAssessment,
  useRejectAssessment,
  useAssessment,
} from "@/services/hooks/assessment.hooks";
import type { Assessment } from "./AssessmentTable";

interface AssessmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  assessment: Assessment | null;
}

export default function AssessmentDetailsModal({
  open,
  onClose,
  assessment,
}: AssessmentDetailsModalProps) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const approveMutation = useApproveAssessment();
  const rejectMutation = useRejectAssessment();

  const { data: fullAssessment, isLoading } = useAssessment(assessment?.id || 0);

  if (!open || !assessment) return null;

  const handleApprove = () => {
    if (!assessment?.id) return;
    approveMutation.mutate(assessment.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleReject = () => {
    if (!assessment?.id || !reason.trim()) return;
    rejectMutation.mutate(
      { assessmentId: assessment.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason("");
          setShowReject(false);
          onClose();
        },
      }
    );
  };

  const approving = approveMutation.isPending;
  const rejecting = rejectMutation.isPending;

  const totals = fullAssessment?.assessmentData?.totals?.totals;
  const breakdown = totals?.breakdown;
  const assessmentData = fullAssessment?.assessmentData;

  const countItems = (arr: any[] | undefined) => arr?.length || 0;
  const hasData = (value: any) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) return Object.keys(value).length > 0;
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "number") return value > 0;
    return false;
  };

  const hasSectionData = (section: any) => {
    if (!section) return false;
    return Object.values(section).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null) {
        return Object.values(value).some((v) => hasData(v));
      }
      return hasData(value);
    });
  };

  // Collect all files from the assessment
  const collectAllFiles = () => {
    const files: any[] = [];
    if (!assessmentData) return files;

    const extractFiles = (obj: any, sectionName: string) => {
      if (!obj) return;
      if (obj.files && typeof obj.files === "object") {
        Object.entries(obj.files).forEach(([key, value]: [string, any]) => {
          if (value && typeof value === "object" && value.name) {
            files.push({ ...value, section: sectionName, field: key });
          }
        });
      }
      if (obj.additionalFields && Array.isArray(obj.additionalFields)) {
        obj.additionalFields.forEach((field: any) => {
          if (field.file && field.file.name) {
            files.push({ ...field.file, section: sectionName, field: field.label || "Additional" });
          }
        });
      }
    };

    // Extract from all sections
    if (assessmentData.stationarySources) {
      extractFiles(
        assessmentData.stationarySources.electricityHeat,
        "Stationary Sources - Electricity & Heat"
      );
      extractFiles(
        assessmentData.stationarySources.industrialProcesses,
        "Stationary Sources - Industrial"
      );
      extractFiles(
        assessmentData.stationarySources.oilGasOperations,
        "Stationary Sources - Oil & Gas"
      );
    }
    if (assessmentData.mobileSources) {
      extractFiles(assessmentData.mobileSources.roadTransport, "Mobile Sources - Road");
      extractFiles(assessmentData.mobileSources.vehicleEquipment, "Mobile Sources - Equipment");
      extractFiles(assessmentData.mobileSources.marineAviation, "Mobile Sources - Marine/Aviation");
    }
    extractFiles(assessmentData.electricity, "Scope 2 - Electricity");
    extractFiles(assessmentData.cooling, "Scope 2 - Cooling");
    extractFiles(assessmentData.steam, "Scope 2 - Steam");
    extractFiles(assessmentData.heating, "Scope 2 - Heating");

    return files;
  };

  const allFiles = collectAllFiles();

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "in_progress":
        return { label: "In Progress", color: "bg-yellow-100 text-yellow-800" };
      case "awaiting_review":
        return { label: "Awaiting Review", color: "bg-blue-100 text-blue-800" };
      case "submitted_approved":
        return { label: "Submitted-Approved", color: "bg-green-100 text-green-800" };
      case "approved":
        return { label: "Approved", color: "bg-green-100 text-green-800" };
      case "unapproved_rejected":
        return { label: "Unapproved/Rejected", color: "bg-red-100 text-red-800" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  const statusDisplay = getStatusDisplay(fullAssessment?.status || assessment.status);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-6xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Assessment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading assessment details...</div>
          </div>
        ) : (
          <>
            {/* Basic Info Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1 text-xs uppercase tracking-wide">
                    Assessment ID
                  </span>
                  <span className="font-semibold text-gray-900 text-lg">
                    #{fullAssessment?.id || assessment.id}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1 text-xs uppercase tracking-wide">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${statusDisplay.color}`}
                  >
                    {statusDisplay.label}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1 text-xs uppercase tracking-wide">
                    Subsidiary
                  </span>
                  <span className="font-medium text-gray-900">
                    {fullAssessment?.subsidiary || assessment.subsidiary || "Not specified"}
                  </span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-gray-500 mb-1 text-xs uppercase tracking-wide">
                    Assessment Period
                  </span>
                  <span className="font-medium text-gray-900">
                    {fullAssessment?.startMonth && fullAssessment?.startYear
                      ? `${fullAssessment.startMonth} ${fullAssessment.startYear} - ${fullAssessment.endMonth} ${fullAssessment.endYear}`
                      : "Period not set"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1 text-xs uppercase tracking-wide">
                    Total Files
                  </span>
                  <span className="font-semibold text-gray-900 text-lg">{allFiles.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1 text-xs uppercase tracking-wide">
                    Created
                  </span>
                  <span className="font-medium text-gray-900">
                    {fullAssessment?.createdAt
                      ? new Date(fullAssessment.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1 text-xs uppercase tracking-wide">
                    Last Updated
                  </span>
                  <span className="font-medium text-gray-900">
                    {fullAssessment?.updatedAt
                      ? new Date(fullAssessment.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1 text-xs uppercase tracking-wide">
                    Reviewed
                  </span>
                  <span className="font-medium text-gray-900">
                    {fullAssessment?.reviewedAt
                      ? new Date(fullAssessment.reviewedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Not reviewed"}
                  </span>
                </div>
              </div>
            </div>

            {/* File Uploads Section */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                Uploaded Files ({allFiles.length})
              </h3>
              {allFiles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No files uploaded for this assessment</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0">
                          {file.type?.startsWith("image/") ? (
                            <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                              <img
                                src={file.preview || file.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                              <span className="text-2xl">📄</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-medium text-gray-900 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{file.section}</p>
                          <p className="text-xs text-gray-400">{file.field}</p>
                          {file.size && (
                            <p className="text-xs text-gray-400 mt-1">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Data Completeness Overview */}
            <div className="bg-purple-50 rounded-lg p-6 mb-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                Data Completeness
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: "Stationary Sources",
                    data: assessmentData?.stationarySources,
                    icon: "",
                  },
                  { label: "Mobile Sources", data: assessmentData?.mobileSources, icon: "" },
                  { label: "Process Emissions", data: assessmentData?.processEmissions, icon: "" },
                  {
                    label: "Fugitive Emissions",
                    data: assessmentData?.fugitiveEmissions,
                    icon: "",
                  },
                  { label: "Purchased Electricity", data: assessmentData?.electricity, icon: "" },
                  { label: "Purchased Cooling", data: assessmentData?.cooling, icon: "" },
                  { label: "Purchased Steam", data: assessmentData?.steam, icon: "" },
                  { label: "Purchased Heating", data: assessmentData?.heating, icon: "" },
                ].map((section, idx) => {
                  const hasContent = hasSectionData(section.data);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        hasContent ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{section.icon}</span>
                        <span
                          className={`text-xs font-medium ${
                            hasContent ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {section.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {hasContent ? (
                          <>
                            <span className="text-green-600 text-lg">✓</span>
                            <span className="text-xs text-green-600 font-medium">Completed</span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-400 text-lg">○</span>
                            <span className="text-xs text-gray-400">No data</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emissions Summary */}
            {totals ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌍</span>
                  Total Emissions Summary
                </h3>
                <div className="mb-6 bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold text-green-700">
                      {totals.sum.toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-600 font-medium">tCO₂e</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Computed on:{" "}
                    {fullAssessment?.assessmentData?.totals?.computedAt
                      ? new Date(fullAssessment.assessmentData.totals.computedAt).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>

                {breakdown && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {breakdown.stationarySources && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">⚡</span>
                          <h4 className="font-semibold text-gray-700 text-sm">
                            Stationary Sources
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {breakdown.stationarySources.sum.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">tCO₂e</p>
                      </div>
                    )}

                    {breakdown.mobileSources && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🚗</span>
                          <h4 className="font-semibold text-gray-700 text-sm">Mobile Sources</h4>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {breakdown.mobileSources.sum.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">tCO₂e</p>
                      </div>
                    )}

                    {breakdown.processEmissions && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🏭</span>
                          <h4 className="font-semibold text-gray-700 text-sm">Process Emissions</h4>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {breakdown.processEmissions.sum.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">tCO₂e</p>
                      </div>
                    )}

                    {breakdown.fugitiveEmissions && (
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">💨</span>
                          <h4 className="font-semibold text-gray-700 text-sm">
                            Fugitive Emissions
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {breakdown.fugitiveEmissions.sum.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">tCO₂e</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-6 mb-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  Emissions Summary
                </h3>
                <p className="text-sm text-gray-600">
                  No emissions data computed yet. Submit the assessment to calculate total
                  emissions.
                </p>
              </div>
            )}

            {/* SCOPE 1 - Detailed Data */}
            {assessmentData &&
              hasSectionData(
                assessmentData.stationarySources ||
                  assessmentData.mobileSources ||
                  assessmentData.processEmissions ||
                  assessmentData.fugitiveEmissions
              ) && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500">
                    Scope 1 Emissions Data
                  </h3>

                  {/* Stationary Sources */}
                  {hasSectionData(assessmentData.stationarySources) && (
                    <div className="bg-blue-50 rounded-lg p-5 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">⚡</span> Stationary Sources
                      </h4>

                      {/* Electricity & Heat */}
                      {assessmentData.stationarySources.electricityHeat && (
                        <div className="bg-white rounded p-4 mb-3">
                          <h5 className="font-medium text-gray-700 mb-2">
                            Electricity & Heat Generation
                          </h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Diesel Generators:</span>
                              <span className="ml-2 font-semibold">
                                {countItems(
                                  assessmentData.stationarySources.electricityHeat.dieselGenerators
                                )}{" "}
                                entries
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Gas Turbines:</span>
                              <span className="ml-2 font-semibold">
                                {countItems(
                                  assessmentData.stationarySources.electricityHeat.gasTurbines
                                )}{" "}
                                entries
                              </span>
                            </div>
                          </div>
                          {assessmentData.stationarySources.electricityHeat.dieselGenerators &&
                            assessmentData.stationarySources.electricityHeat.dieselGenerators
                              .length > 0 && (
                              <div className="mt-3 space-y-2">
                                {assessmentData.stationarySources.electricityHeat.dieselGenerators.map(
                                  (gen: any, idx: number) => (
                                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                      <span className="font-medium">{gen.fuelType}</span>:{" "}
                                      {gen.volume} {gen.unit}
                                      <span className="text-gray-500 ml-2">
                                        (Emission Factor: {gen.emissionFactor})
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      )}

                      {/* Industrial Processes */}
                      {assessmentData.stationarySources.industrialProcesses && (
                        <div className="bg-white rounded p-4 mb-3">
                          <h5 className="font-medium text-gray-700 mb-2">Industrial Processes</h5>
                          <div className="text-sm">
                            <span className="text-gray-600">Boilers & Furnaces:</span>
                            <span className="ml-2 font-semibold">
                              {countItems(
                                assessmentData.stationarySources.industrialProcesses.boilerFurnaces
                              )}{" "}
                              entries
                            </span>
                          </div>
                          {assessmentData.stationarySources.industrialProcesses.boilerFurnaces &&
                            assessmentData.stationarySources.industrialProcesses.boilerFurnaces
                              .length > 0 && (
                              <div className="mt-3 space-y-2">
                                {assessmentData.stationarySources.industrialProcesses.boilerFurnaces.map(
                                  (item: any, idx: number) => (
                                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                      <span className="font-medium">{item.fuelType}</span>:{" "}
                                      {item.volume} {item.unit}
                                      <span className="text-gray-500 ml-2">
                                        (Emission Factor: {item.emissionFactor})
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      )}

                      {/* Oil & Gas Operations */}
                      {assessmentData.stationarySources.oilGasOperations && (
                        <div className="bg-white rounded p-4">
                          <h5 className="font-medium text-gray-700 mb-2">Oil & Gas Operations</h5>
                          <div className="text-sm">
                            <span className="text-gray-600">Onshore Production:</span>
                            <span className="ml-2 font-semibold">
                              {countItems(
                                assessmentData.stationarySources.oilGasOperations.onShoreProduction
                              )}{" "}
                              entries
                            </span>
                          </div>
                          {assessmentData.stationarySources.oilGasOperations.onShoreProduction &&
                            assessmentData.stationarySources.oilGasOperations.onShoreProduction
                              .length > 0 && (
                              <div className="mt-3 space-y-2">
                                {assessmentData.stationarySources.oilGasOperations.onShoreProduction.map(
                                  (item: any, idx: number) => (
                                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                      <span className="font-medium">{item.fuelType}</span>:{" "}
                                      {item.volume} {item.unit}
                                      <span className="text-gray-500 ml-2">
                                        (Emission Factor: {item.emissionFactor})
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Sources */}
                  {hasSectionData(assessmentData.mobileSources) && (
                    <div className="bg-orange-50 rounded-lg p-5 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-orange-600">🚗</span> Mobile Sources
                      </h4>

                      {/* Road Transport */}
                      {assessmentData.mobileSources.roadTransport && (
                        <div className="bg-white rounded p-4 mb-3">
                          <h5 className="font-medium text-gray-700 mb-2">Road Transport</h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Vehicle Fleet:</span>
                              <span className="ml-2 font-semibold">
                                {countItems(
                                  assessmentData.mobileSources.roadTransport.vehicleFleet
                                )}{" "}
                                entries
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Cars & Buses:</span>
                              <span className="ml-2 font-semibold">
                                {countItems(assessmentData.mobileSources.roadTransport.carsBuses)}{" "}
                                entries
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Vehicle Equipment */}
                      {assessmentData.mobileSources.vehicleEquipment && (
                        <div className="bg-white rounded p-4 mb-3">
                          <h5 className="font-medium text-gray-700 mb-2">Vehicle Equipment</h5>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Forklifts:</span>
                              <span className="ml-2 font-semibold">
                                {countItems(
                                  assessmentData.mobileSources.vehicleEquipment.forkliftFuelType
                                )}{" "}
                                entries
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Heavy Duty:</span>
                              <span className="ml-2 font-semibold">
                                {countItems(
                                  assessmentData.mobileSources.vehicleEquipment.heavyDutyFuelType
                                )}{" "}
                                entries
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Tractors:</span>
                              <span className="ml-2 font-semibold">
                                {countItems(
                                  assessmentData.mobileSources.vehicleEquipment.tractorFuelType
                                )}{" "}
                                entries
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Marine & Aviation */}
                      {assessmentData.mobileSources.marineAviation && (
                        <div className="bg-white rounded p-4">
                          <h5 className="font-medium text-gray-700 mb-2">Marine & Aviation</h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Air Transport:</span>
                              <span className="ml-2 font-semibold">
                                {countItems(assessmentData.mobileSources.marineAviation.air)}{" "}
                                entries
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Marine Transport:</span>
                              <span className="ml-2 font-semibold">
                                {countItems(assessmentData.mobileSources.marineAviation.marine)}{" "}
                                entries
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Process Emissions */}
                  {hasSectionData(assessmentData.processEmissions) && (
                    <div className="bg-purple-50 rounded-lg p-5 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-purple-600">🏭</span> Process Emissions
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Cement Manufacturing */}
                        {assessmentData.processEmissions.cementManufacturing && (
                          <div className="bg-white rounded p-4">
                            <h5 className="font-medium text-gray-700 mb-2">Cement Manufacturing</h5>
                            <div className="text-sm">
                              <span className="text-gray-600">Quantity:</span>
                              <span className="ml-2 font-semibold text-lg">
                                {assessmentData.processEmissions.cementManufacturing
                                  .cementQuantity || 0}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Gas Flaring */}
                        {assessmentData.processEmissions.gasFlaring && (
                          <div className="bg-white rounded p-4">
                            <h5 className="font-medium text-gray-700 mb-2">Gas Flaring</h5>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="text-gray-600">Gas Volume:</span>
                                <span className="ml-2 font-semibold">
                                  {assessmentData.processEmissions.gasFlaring.gasVolume || 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Carbon Content:</span>
                                <span className="ml-2 font-semibold">
                                  {assessmentData.processEmissions.gasFlaring.carbonContent || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fugitive Emissions */}
                  {hasSectionData(assessmentData.fugitiveEmissions) && (
                    <div className="bg-red-50 rounded-lg p-5 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-red-600">💨</span> Fugitive Emissions
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Venting Natural Gas */}
                        {assessmentData.fugitiveEmissions.ventingNaturalGas && (
                          <div className="bg-white rounded p-4">
                            <h5 className="font-medium text-gray-700 mb-2">Venting Natural Gas</h5>
                            <div className="text-sm">
                              <span className="text-gray-600">Volume Vented:</span>
                              <span className="ml-2 font-semibold text-lg">
                                {assessmentData.fugitiveEmissions.ventingNaturalGas
                                  .volumeOfGasVented || 0}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* HFC Leaks */}
                        {assessmentData.fugitiveEmissions.hfcLeaks && (
                          <div className="bg-white rounded p-4">
                            <h5 className="font-medium text-gray-700 mb-2">
                              HFC Leaks (Refrigerants)
                            </h5>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="text-gray-600">Refrigerant Added:</span>
                                <span className="ml-2 font-semibold">
                                  {assessmentData.fugitiveEmissions.hfcLeaks.refrigerantAdded || 0}
                                </span>
                              </div>
                              <div className="flex gap-2 flex-wrap mt-2">
                                {assessmentData.fugitiveEmissions.hfcLeaks.R134a && (
                                  <Badge variant="outline">R134a</Badge>
                                )}
                                {assessmentData.fugitiveEmissions.hfcLeaks.R410A && (
                                  <Badge variant="outline">R410A</Badge>
                                )}
                                {assessmentData.fugitiveEmissions.hfcLeaks.R404A && (
                                  <Badge variant="outline">R404A</Badge>
                                )}
                                {assessmentData.fugitiveEmissions.hfcLeaks.R407C && (
                                  <Badge variant="outline">R407C</Badge>
                                )}
                                {assessmentData.fugitiveEmissions.hfcLeaks.R507A && (
                                  <Badge variant="outline">R507A</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* SCOPE 2 - Detailed Data */}
            {assessmentData &&
              (hasData(assessmentData.electricity?.electricityConsumed) ||
                hasData(assessmentData.cooling?.coolingConsumed) ||
                hasData(assessmentData.steam?.volume) ||
                hasData(assessmentData.heating?.heatingConsumed) ||
                hasData(assessmentData.ipps?.electricityConsumed) ||
                hasData(assessmentData.eac?.gridElectricity) ||
                hasData(assessmentData.residual?.electricityConsumed) ||
                hasData(assessmentData.coolingSteam?.energyConsumed)) && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                    Scope 2 Emissions Data
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Electricity */}
                    {assessmentData.electricity &&
                      hasData(assessmentData.electricity.electricityConsumed) && (
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span>⚡</span> Purchased Electricity
                          </h5>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-600">Consumed:</span>
                              <span className="ml-2 font-semibold">
                                {assessmentData.electricity.electricityConsumed}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Supplier:</span>
                              <span className="ml-2 font-semibold">
                                {assessmentData.electricity.supplier || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Cooling */}
                    {assessmentData.cooling && hasData(assessmentData.cooling.coolingConsumed) && (
                      <div className="bg-cyan-50 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <span>❄️</span> Purchased Cooling
                        </h5>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-600">Consumed:</span>
                            <span className="ml-2 font-semibold">
                              {assessmentData.cooling.coolingConsumed}
                            </span>
                          </div>
                          {assessmentData.cooling.selectedSystems &&
                            assessmentData.cooling.selectedSystems.length > 0 && (
                              <div className="flex gap-1 flex-wrap mt-2">
                                {assessmentData.cooling.selectedSystems.map(
                                  (sys: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {sys}
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Steam */}
                    {assessmentData.steam && hasData(assessmentData.steam.volume) && (
                      <div className="bg-gray-100 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <span>♨️</span> Purchased Steam
                        </h5>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-600">Volume:</span>
                            <span className="ml-2 font-semibold">
                              {assessmentData.steam.volume}
                            </span>
                          </div>
                          {assessmentData.steam.selectedSources &&
                            assessmentData.steam.selectedSources.length > 0 && (
                              <div className="flex gap-1 flex-wrap mt-2">
                                {assessmentData.steam.selectedSources.map(
                                  (src: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {src}
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Heating */}
                    {assessmentData.heating && hasData(assessmentData.heating.heatingConsumed) && (
                      <div className="bg-orange-100 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <span>🔥</span> Purchased Heating
                        </h5>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-600">Consumed:</span>
                            <span className="ml-2 font-semibold">
                              {assessmentData.heating.heatingConsumed}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Supplier:</span>
                            <span className="ml-2 font-semibold">
                              {assessmentData.heating.supplierName || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IPPS */}
                    {assessmentData.ipps && hasData(assessmentData.ipps.electricityConsumed) && (
                      <div className="bg-green-100 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <span>🔌</span> IPPS
                        </h5>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-600">Electricity:</span>
                            <span className="ml-2 font-semibold">
                              {assessmentData.ipps.electricityConsumed}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Emission Factor:</span>
                            <span className="ml-2 font-semibold">
                              {assessmentData.ipps.emissionFactor || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* EAC */}
                    {assessmentData.eac && hasData(assessmentData.eac.gridElectricity) && (
                      <div className="bg-teal-100 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <span>🌐</span> EAC
                        </h5>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-600">Grid Electricity:</span>
                            <span className="ml-2 font-semibold">
                              {assessmentData.eac.gridElectricity}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Emission Factor:</span>
                            <span className="ml-2 font-semibold">
                              {assessmentData.eac.emissionFactor || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Residual */}
                    {assessmentData.residual &&
                      hasData(assessmentData.residual.electricityConsumed) && (
                        <div className="bg-indigo-100 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span>⚙️</span> Residual Mix
                          </h5>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-600">Electricity:</span>
                              <span className="ml-2 font-semibold">
                                {assessmentData.residual.electricityConsumed}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Mix Factor:</span>
                              <span className="ml-2 font-semibold">
                                {assessmentData.residual.residualMixFactor || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Cooling Steam */}
                    {assessmentData.coolingSteam &&
                      hasData(assessmentData.coolingSteam.energyConsumed) && (
                        <div className="bg-pink-100 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <span>💧</span> Cooling Steam
                          </h5>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-600">Energy Consumed:</span>
                              <span className="ml-2 font-semibold">
                                {assessmentData.coolingSteam.energyConsumed}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Emission Factor:</span>
                              <span className="ml-2 font-semibold">
                                {assessmentData.coolingSteam.emissionFactor || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

            {/* Show rejection reason if assessment was rejected */}
            {assessment.status === "unapproved_rejected" && assessment.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</h4>
                <p className="text-sm text-red-700">{assessment.rejection_reason}</p>
              </div>
            )}

            {/* Action Buttons - Only show for awaiting_review status */}
            {assessment.status === "awaiting_review" && (
              <>
                {/* Action Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Approving this ESG data will conclude the assessment
                    cycle and will generate the report for this assessment.
                  </p>
                </div>

                {!showReject && (
                  <div className="flex gap-4 justify-end">
                    <Button
                      variant="secondary"
                      className="bg-[var(--color-primary)] hover:bg-teal-600 text-white rounded-sm px-6 py-2"
                      onClick={handleApprove}
                      disabled={approving}
                    >
                      {approving ? "Approving..." : "Approve Assessment"}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-sm px-6 py-2 border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => setShowReject(true)}
                      disabled={rejecting}
                    >
                      Reject Assessment
                    </Button>
                  </div>
                )}

                {/* Rejection Section */}
                {showReject && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Rejection Reason
                    </label>
                    <Textarea
                      className="mt-2 bg-white"
                      placeholder="Provide a brief reason for rejection"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                    />
                    <div className="mt-4 flex justify-end gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => setShowReject(false)}
                        disabled={rejecting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600 text-white px-6"
                        onClick={handleReject}
                        disabled={!reason.trim() || rejecting}
                      >
                        {rejecting ? "Submitting..." : "Confirm Rejection"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
