/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { useApproveAssessment, useUnapproveAssessment, useAssessment } from "@/services/hooks/assessment.hooks";
import type { Assessment } from "./AssessmentTable";

interface AssessmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  assessment: Assessment | null;
}

export default function AssessmentDetailsModal({ open, onClose, assessment }: AssessmentDetailsModalProps) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const approveMutation = useApproveAssessment();
  const unapproveMutation = useUnapproveAssessment();

  // Fetch full assessment details from backend
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

  const handleUnapprove = () => {
    if (!assessment?.id || !reason.trim()) return;
    unapproveMutation.mutate(
      { assessmentId: assessment.id, rejectionReason: reason.trim() },
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
  const unapproving = unapproveMutation.isPending;

  // Extract totals if available
  const totals = fullAssessment?.assessmentData?.totals?.totals;
  const breakdown = totals?.breakdown;
  const assessmentData = fullAssessment?.assessmentData;

  // Helper to count items in arrays
  const countItems = (arr: any[] | undefined) => arr?.length || 0;
  const hasData = (value: any) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return value > 0;
    return false;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-6xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Assessment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading assessment details...</div>
          </div>
        ) : (
          <>
            {/* Basic Info Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Assessment ID</span>
                  <span className="font-medium text-gray-900">{fullAssessment?.id || assessment.id}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Status</span>
                  <Badge className="capitalize w-fit">{fullAssessment?.status || assessment.status}</Badge>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Subsidiary</span>
                  <span className="font-medium text-gray-900">{fullAssessment?.subsidiary || assessment.subsidiary}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Assessment Period</span>
                  <span className="font-medium text-gray-900">
                    {fullAssessment?.startMonth} {fullAssessment?.startYear} - {fullAssessment?.endMonth} {fullAssessment?.endYear}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Created At</span>
                  <span className="font-medium text-gray-900">
                    {fullAssessment?.createdAt ? new Date(fullAssessment.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Last Updated</span>
                  <span className="font-medium text-gray-900">
                    {fullAssessment?.updatedAt ? new Date(fullAssessment.updatedAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Emissions Summary */}
            {totals && (
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Emissions Summary</h3>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-700">{totals.sum.toFixed(4)}</span>
                    <span className="text-lg text-gray-600">tCO2e</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Computed at: {fullAssessment?.assessmentData?.totals?.computedAt 
                      ? new Date(fullAssessment.assessmentData.totals.computedAt).toLocaleString() 
                      : "N/A"}
                  </p>
                </div>

                {breakdown && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Stationary Sources */}
                    {breakdown.stationarySources && (
                      <div className="bg-white rounded p-4">
                        <h4 className="font-semibold text-gray-700 text-sm mb-2">Stationary Sources</h4>
                        <p className="text-2xl font-bold text-gray-900">{breakdown.stationarySources.sum.toFixed(4)}</p>
                        <p className="text-xs text-gray-500">tCO2e</p>
                      </div>
                    )}

                    {/* Mobile Sources */}
                    {breakdown.mobileSources && (
                      <div className="bg-white rounded p-4">
                        <h4 className="font-semibold text-gray-700 text-sm mb-2">Mobile Sources</h4>
                        <p className="text-2xl font-bold text-gray-900">{breakdown.mobileSources.sum.toFixed(4)}</p>
                        <p className="text-xs text-gray-500">tCO2e</p>
                      </div>
                    )}

                    {/* Process Emissions */}
                    {breakdown.processEmissions && (
                      <div className="bg-white rounded p-4">
                        <h4 className="font-semibold text-gray-700 text-sm mb-2">Process Emissions</h4>
                        <p className="text-2xl font-bold text-gray-900">{breakdown.processEmissions.sum.toFixed(4)}</p>
                        <p className="text-xs text-gray-500">tCO2e</p>
                      </div>
                    )}

                    {/* Fugitive Emissions */}
                    {breakdown.fugitiveEmissions && (
                      <div className="bg-white rounded p-4">
                        <h4 className="font-semibold text-gray-700 text-sm mb-2">Fugitive Emissions</h4>
                        <p className="text-2xl font-bold text-gray-900">{breakdown.fugitiveEmissions.sum.toFixed(4)}</p>
                        <p className="text-xs text-gray-500">tCO2e</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SCOPE 1 - Detailed Data */}
            {assessmentData && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500">Scope 1 Emissions Data</h3>
                
                {/* Stationary Sources */}
                {assessmentData.stationarySources && (
                  <div className="bg-blue-50 rounded-lg p-5 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-blue-600">⚡</span> Stationary Sources
                    </h4>
                    
                    {/* Electricity & Heat */}
                    {assessmentData.stationarySources.electricityHeat && (
                      <div className="bg-white rounded p-4 mb-3">
                        <h5 className="font-medium text-gray-700 mb-2">Electricity & Heat Generation</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Diesel Generators:</span>
                            <span className="ml-2 font-semibold">{countItems(assessmentData.stationarySources.electricityHeat.dieselGenerators)} entries</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Gas Turbines:</span>
                            <span className="ml-2 font-semibold">{countItems(assessmentData.stationarySources.electricityHeat.gasTurbines)} entries</span>
                          </div>
                        </div>
                        {assessmentData.stationarySources.electricityHeat.dieselGenerators && assessmentData.stationarySources.electricityHeat.dieselGenerators.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {assessmentData.stationarySources.electricityHeat.dieselGenerators.map((gen: any, idx: number) => (
                              <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                <span className="font-medium">{gen.fuelType}</span>: {gen.volume} {gen.unit} 
                                <span className="text-gray-500 ml-2">(EF: {gen.emissionFactor})</span>
                              </div>
                            ))}
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
                          <span className="ml-2 font-semibold">{countItems(assessmentData.stationarySources.industrialProcesses.boilerFurnaces)} entries</span>
                        </div>
                        {assessmentData.stationarySources.industrialProcesses.boilerFurnaces && assessmentData.stationarySources.industrialProcesses.boilerFurnaces.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {assessmentData.stationarySources.industrialProcesses.boilerFurnaces.map((item: any, idx: number) => (
                              <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                <span className="font-medium">{item.fuelType}</span>: {item.volume} {item.unit}
                                <span className="text-gray-500 ml-2">(EF: {item.emissionFactor})</span>
                              </div>
                            ))}
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
                          <span className="ml-2 font-semibold">{countItems(assessmentData.stationarySources.oilGasOperations.onShoreProduction)} entries</span>
                        </div>
                        {assessmentData.stationarySources.oilGasOperations.onShoreProduction && assessmentData.stationarySources.oilGasOperations.onShoreProduction.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {assessmentData.stationarySources.oilGasOperations.onShoreProduction.map((item: any, idx: number) => (
                              <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                <span className="font-medium">{item.fuelType}</span>: {item.volume} {item.unit}
                                <span className="text-gray-500 ml-2">(EF: {item.emissionFactor})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Sources */}
                {assessmentData.mobileSources && (
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
                            <span className="ml-2 font-semibold">{countItems(assessmentData.mobileSources.roadTransport.vehicleFleet)} entries</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Cars & Buses:</span>
                            <span className="ml-2 font-semibold">{countItems(assessmentData.mobileSources.roadTransport.carsBuses)} entries</span>
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
                            <span className="ml-2 font-semibold">{countItems(assessmentData.mobileSources.vehicleEquipment.forkliftFuelType)} entries</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Heavy Duty:</span>
                            <span className="ml-2 font-semibold">{countItems(assessmentData.mobileSources.vehicleEquipment.heavyDutyFuelType)} entries</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tractors:</span>
                            <span className="ml-2 font-semibold">{countItems(assessmentData.mobileSources.vehicleEquipment.tractorFuelType)} entries</span>
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
                            <span className="ml-2 font-semibold">{countItems(assessmentData.mobileSources.marineAviation.air)} entries</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Marine Transport:</span>
                            <span className="ml-2 font-semibold">{countItems(assessmentData.mobileSources.marineAviation.marine)} entries</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Process Emissions */}
                {assessmentData.processEmissions && (
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
                            <span className="ml-2 font-semibold text-lg">{assessmentData.processEmissions.cementManufacturing.cementQuantity || 0}</span>
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
                              <span className="ml-2 font-semibold">{assessmentData.processEmissions.gasFlaring.gasVolume || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Carbon Content:</span>
                              <span className="ml-2 font-semibold">{assessmentData.processEmissions.gasFlaring.carbonContent || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fugitive Emissions */}
                {assessmentData.fugitiveEmissions && (
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
                            <span className="ml-2 font-semibold text-lg">{assessmentData.fugitiveEmissions.ventingNaturalGas.volumeOfGasVented || 0}</span>
                          </div>
                        </div>
                      )}

                      {/* HFC Leaks */}
                      {assessmentData.fugitiveEmissions.hfcLeaks && (
                        <div className="bg-white rounded p-4">
                          <h5 className="font-medium text-gray-700 mb-2">HFC Leaks (Refrigerants)</h5>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-600">Refrigerant Added:</span>
                              <span className="ml-2 font-semibold">{assessmentData.fugitiveEmissions.hfcLeaks.refrigerantAdded || 0}</span>
                            </div>
                            <div className="flex gap-2 flex-wrap mt-2">
                              {assessmentData.fugitiveEmissions.hfcLeaks.R134a && <Badge variant="outline">R134a</Badge>}
                              {assessmentData.fugitiveEmissions.hfcLeaks.R410A && <Badge variant="outline">R410A</Badge>}
                              {assessmentData.fugitiveEmissions.hfcLeaks.R404A && <Badge variant="outline">R404A</Badge>}
                              {assessmentData.fugitiveEmissions.hfcLeaks.R407C && <Badge variant="outline">R407C</Badge>}
                              {assessmentData.fugitiveEmissions.hfcLeaks.R507A && <Badge variant="outline">R507A</Badge>}
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
            {assessmentData && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">Scope 2 Emissions Data</h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Electricity */}
                  {assessmentData.electricity && hasData(assessmentData.electricity.electricityConsumed) && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span>⚡</span> Purchased Electricity
                      </h5>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-gray-600">Consumed:</span>
                          <span className="ml-2 font-semibold">{assessmentData.electricity.electricityConsumed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Supplier:</span>
                          <span className="ml-2 font-semibold">{assessmentData.electricity.supplier || "N/A"}</span>
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
                          <span className="ml-2 font-semibold">{assessmentData.cooling.coolingConsumed}</span>
                        </div>
                        {assessmentData.cooling.selectedSystems && assessmentData.cooling.selectedSystems.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {assessmentData.cooling.selectedSystems.map((sys: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{sys}</Badge>
                            ))}
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
                          <span className="ml-2 font-semibold">{assessmentData.steam.volume}</span>
                        </div>
                        {assessmentData.steam.selectedSources && assessmentData.steam.selectedSources.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {assessmentData.steam.selectedSources.map((src: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{src}</Badge>
                            ))}
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
                          <span className="ml-2 font-semibold">{assessmentData.heating.heatingConsumed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Supplier:</span>
                          <span className="ml-2 font-semibold">{assessmentData.heating.supplierName || "N/A"}</span>
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
                          <span className="ml-2 font-semibold">{assessmentData.ipps.electricityConsumed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Emission Factor:</span>
                          <span className="ml-2 font-semibold">{assessmentData.ipps.emissionFactor || "N/A"}</span>
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
                          <span className="ml-2 font-semibold">{assessmentData.eac.gridElectricity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Emission Factor:</span>
                          <span className="ml-2 font-semibold">{assessmentData.eac.emissionFactor || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Residual */}
                  {assessmentData.residual && hasData(assessmentData.residual.electricityConsumed) && (
                    <div className="bg-indigo-100 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span>⚙️</span> Residual Mix
                      </h5>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-gray-600">Electricity:</span>
                          <span className="ml-2 font-semibold">{assessmentData.residual.electricityConsumed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mix Factor:</span>
                          <span className="ml-2 font-semibold">{assessmentData.residual.residualMixFactor || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cooling Steam */}
                  {assessmentData.coolingSteam && hasData(assessmentData.coolingSteam.energyConsumed) && (
                    <div className="bg-pink-100 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span>💧</span> Cooling Steam
                      </h5>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-gray-600">Energy Consumed:</span>
                          <span className="ml-2 font-semibold">{assessmentData.coolingSteam.energyConsumed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Emission Factor:</span>
                          <span className="ml-2 font-semibold">{assessmentData.coolingSteam.emissionFactor || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Approving will generate the report for this assessment.
              </p>
            </div>

            {/* Action Buttons */}
            {!showReject && (
              <div className="flex gap-4 justify-end">
                <Button
                  variant="secondary"
                  className="bg-green-500 hover:bg-green-600 text-white rounded-sm px-6 py-2"
                  onClick={handleApprove}
                  disabled={approving}
                >
                  {approving ? "Approving..." : "Approve Assessment"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-sm px-6 py-2"
                  onClick={() => setShowReject(true)}
                  disabled={unapproving}
                >
                  Unapprove Assessment
                </Button>
              </div>
            )}

            {/* Rejection Section */}
            {showReject && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Rejection Reason</label>
                <Textarea
                  className="mt-2 bg-white"
                  placeholder="Provide a brief reason for unapproval"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
                <div className="mt-4 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowReject(false)} disabled={unapproving}>Cancel</Button>
                  <Button
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white px-6"
                    onClick={handleUnapprove}
                    disabled={!reason.trim() || unapproving}
                  >
                    {unapproving ? "Submitting..." : "Confirm Unapprove"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
