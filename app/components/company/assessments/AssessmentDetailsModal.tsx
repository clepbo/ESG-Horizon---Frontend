"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { ScrollArea } from "../../ui/scroll-area";
import { Progress } from "@/app/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Clock,
  Zap,
  Leaf,
  Users,
  Building2,
  ChevronRight,
  Droplets,
  Wind,
  TreeDeciduous,
} from "lucide-react";
import Image from "next/image";
import {
  useAssessment,
  useApproveAssessment,
  useDeclineAssessment,
} from "@/services/hooks/assessment.hooks";
import type { Assessment } from "./AssessmentTable";
import { Separator } from "@/app/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { allFuels } from "@/lib/fuelDataFile";
import { formatNumberFull, formatNumberShort } from "@/lib/numberFormat";

interface FileWithMeta {
  name: string;
  url?: string;
  section: string;
}

const DataField = ({ label, value, unit }: { label: string; value: any; unit?: string }) => {
  const isEmpty = value === undefined || value === null || value === "";
  const isNumeric = !isEmpty && !isNaN(Number(value));

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1">
        {isEmpty ? (
          <span className="text-gray-400 text-xs italic">n/a</span>
        ) : (
          <>
            <span className="text-sm font-semibold text-gray-800">
              {isNumeric ? formatNumberFull(value) : value}
            </span>
            {unit && <span className="text-[10px] text-gray-500 font-normal">{unit}</span>}
          </>
        )}
      </div>
    </div>
  );
};

const DataList = ({ data, label }: { data: any[]; label: string }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3 mt-4 first:mt-0">
      <h5 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2 border-b border-teal-50 pb-1">
        {label}
      </h5>
      <div className="space-y-2">
        {data.map((item, idx) => {
          const fuelLabel = allFuels.find((f) => f.value === item.fuelType)?.label || item.fuelType;
          return (
            <div
              key={item.id || idx}
              className="p-3 bg-gray-50/50 rounded-md border border-gray-100 space-y-2"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {Object.entries(item).map(([key, val]) => {
                  if (["id"].includes(key)) return null;
                  if (val === undefined || val === null || val === "") return null;

                  let displayValue = String(val);
                  const displayLabel = key.replace(/([A-Z])/g, " $1").trim();

                  if (key === "fuelType") {
                    displayValue = fuelLabel;
                  }

                  const isNumericValue = !isNaN(Number(displayValue)) && key !== "fuelType";

                  return (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                        {displayLabel}
                      </span>
                      <span className="text-xs font-semibold text-gray-700 truncate">
                        {isNumericValue ? formatNumberFull(displayValue) : displayValue}
                        {key === "volume" && item.unit ? ` ${item.unit}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
    <div className="p-1.5 bg-teal-50 rounded-md">
      <Icon className="w-4 h-4 text-teal-600" />
    </div>
    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{title}</h4>
  </div>
);

const MetricCard = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <Card className="bg-white border-gray-100 shadow-xs overflow-hidden">
    {title && (
      <CardHeader className="py-3 px-4 bg-gray-50/50 border-b border-gray-100">
        <CardTitle className="text-xs font-bold text-gray-600 uppercase">{title}</CardTitle>
      </CardHeader>
    )}
    <CardContent className="p-4">{children}</CardContent>
  </Card>
);

export function AssessmentDetailsModal({
  open,
  onClose,
  assessment,
}: {
  open: boolean;
  onClose: () => void;
  assessment: Assessment | null;
}) {
  const [selectedFile, setSelectedFile] = useState<FileWithMeta | null>(null);
  const { data: fullAssessment, isLoading } = useAssessment(assessment?.id);

  const approveMutation = useApproveAssessment();
  const declineMutation = useDeclineAssessment();
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineValidationError, setDeclineValidationError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !assessment) return null;

  if (isLoading || !fullAssessment?.data) {
    return (
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Card className="w-full max-w-4xl p-12 ">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="text-gray-600">Loading assessment details...</p>
          </div>
        </Card>
      </div>
    );
  }

  const data = fullAssessment.data;
  const assessmentData = data.assessmentData || {};
  const env = assessmentData.environment || {};
  const ghg = env.ghg || {};
  const scope1 = ghg.scope1 || {};

  const allFiles: FileWithMeta[] = [];
  const extractFiles = (obj: any, section: string) => {
    if (!obj) return;
    if (obj.files && typeof obj.files === "object") {
      Object.values(obj.files).forEach((f: any) => f?.url && allFiles.push({ ...f, section }));
    }
    if (Array.isArray(obj.additionalFields)) {
      obj.additionalFields.forEach(
        (f: any) => f?.url && allFiles.push({ name: f.name || "File", url: f.url, section })
      );
    }
  };

  extractFiles(scope1.stationarySources?.electricityHeat, "Stationary - Electricity & Heat");
  extractFiles(scope1.stationarySources?.industrialProcesses, "Stationary - Industrial");
  extractFiles(scope1.stationarySources?.oilGasOperations, "Stationary - Oil & Gas");
  extractFiles(scope1.mobileSources?.roadTransport, "Mobile - Road Transport");
  extractFiles(scope1.mobileSources?.vehicleEquipment, "Mobile - Vehicle Equipment");
  extractFiles(scope1.mobileSources?.marineAviation, "Mobile - Marine/Aviation");
  extractFiles(scope1.processEmissions?.cementManufacturing, "Process - Cement");
  extractFiles(scope1.processEmissions?.gasFlaring, "Process - Gas Flaring");
  extractFiles(scope1.fugitiveEmissions?.ventingNaturalGas, "Fugitive - Venting");
  extractFiles(scope1.fugitiveEmissions?.hfcLeaks, "Fugitive - HFC Leaks");

  // Scope 2
  const scope2 = ghg.scope2 || {};
  extractFiles(scope2.locationBased?.electricity, "Scope 2 - Location Electricity");
  extractFiles(scope2.locationBased?.cooling, "Scope 2 - Location Cooling");
  extractFiles(scope2.locationBased?.steam, "Scope 2 - Location Steam");
  extractFiles(scope2.locationBased?.heating, "Scope 2 - Location Heating");
  extractFiles(scope2.marketBased?.ipps, "Scope 2 - Market IPPs");
  extractFiles(scope2.marketBased?.eac, "Scope 2 - Market EAC");
  extractFiles(scope2.marketBased?.residual, "Scope 2 - Market Residual");
  extractFiles(scope2.marketBased?.coolingSteam, "Scope 2 - Market Cooling/Steam");

  // Scope 3
  const scope3 = ghg.scope3 || {};
  const upstream = scope3.upstream || {};
  const downstream = scope3.downstream || {};
  extractFiles(upstream.purchasedGoodsAndServices, "Scope 3 - Purchased Goods");
  extractFiles(upstream.capitalGoods, "Scope 3 - Capital Goods");
  extractFiles(upstream.fuelEnergyRelatedActivities, "Scope 3 - Fuel/Energy Related");
  extractFiles(upstream.upstreamTransportationDistribution, "Scope 3 - Upstream Transport");
  extractFiles(upstream.wasteGeneratedInOperations, "Scope 3 - Waste in Ops");
  extractFiles(upstream.businessTravel, "Scope 3 - Business Travel");
  extractFiles(upstream.employeeCommuting, "Scope 3 - Employee Commuting");
  extractFiles(upstream.upstreamLeasedAssets, "Scope 3 - Upstream Leased");

  extractFiles(downstream.downstreamTransportationDistribution, "Scope 3 - Downstream Transport");
  extractFiles(downstream.processingSoldProducts, "Scope 3 - Processing Sold");
  extractFiles(downstream.useOfSoldProducts, "Scope 3 - Use of Sold");
  extractFiles(downstream.endOfLifeTreatment, "Scope 3 - End of Life");
  extractFiles(downstream.downstreamLeasedAssets, "Scope 3 - Downstream Leased");
  extractFiles(downstream.franchises, "Scope 3 - Franchises");
  extractFiles(downstream.investments, "Scope 3 - Investments");

  const statusConfig = {
    in_progress: {
      label: "In Progress",
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="w-4 h-4" />,
    },
    awaiting_review: {
      label: "Awaiting Review",
      color: "bg-blue-100 text-blue-800",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    submitted_approved: {
      label: "Submitted-Approved",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    approved: {
      label: "Approved",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    declined: {
      label: "Declined",
      color: "bg-red-100 text-red-800",
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const statusInfo =
    statusConfig[data.status as keyof typeof statusConfig] || statusConfig.in_progress;

  const isActionLoading = approveMutation.isPending || declineMutation.isPending;

  const isAwaitingApproval =
    (data.status && data.status === "awaiting_review") || assessment?.status === "awaiting_review";

  const handleApprove = () => {
    if (!assessment?.id || isActionLoading) return;
    approveMutation.mutate(assessment.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleOpenDecline = () => {
    setShowDeclineReason(true);
    setDeclineValidationError("");
  };

  const handleCancelDecline = () => {
    setShowDeclineReason(false);
    setDeclineReason("");
    setDeclineValidationError("");
  };

  const handleConfirmDecline = () => {
    if (!assessment?.id || isActionLoading) return;
    if (!declineReason.trim()) {
      setDeclineValidationError("Please enter a reason for rejection.");
      return;
    }
    declineMutation.mutate(
      { assessmentId: assessment.id, reason: declineReason },
      {
        onSuccess: () => {
          setShowDeclineReason(false);
          setDeclineReason("");
          onClose();
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 w-full max-w-6xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full max-w-7xl shadow-2xl bg-white">
          <CardHeader className="sticky top-0 bg-white border-b z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Assessment Details</h2>
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  {statusInfo.icon} {statusInfo.label}
                </Badge>
              </div>

              <button
                onClick={onClose}
                className="hover:bg-red-50 rounded-md p-2 transition-colors cursor-pointer"
              >
                <XCircle className="w-8 h-8 text-red-600 " strokeWidth={2.5} />
              </button>
            </div>
          </CardHeader>

          <ScrollArea className="h-[80vh]">
            <CardContent className="p-6 space-y-8">
              {/* HERO SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-linear-to-br from-teal-500 to-emerald-600 text-white">
                  <CardContent className="p-6 overflow-hidden">
                    <p className="text-teal-100 text-sm">Total Emissions</p>

                    <p
                      className={`font-bold whitespace-normal wrap-break-word ${String(formatNumberShort(assessmentData.totalEmission) || "0.00").length > 10
                          ? "text-2xl"
                          : String(formatNumberShort(assessmentData.totalEmission) || "0.00").length >
                            7
                            ? "text-3xl"
                            : "text-4xl"
                        }`}
                    >
                      {formatNumberShort(assessmentData.totalEmission) || "0.00"} tCO₂e
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500 text-sm">Overall Progress</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Progress value={assessmentData.overallProgress || 0} className="flex-1" />
                      <span className="text-2xl font-bold">
                        {assessmentData.overallProgress || 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500 text-sm">Subsidiary</p>
                    <p className="text-xl font-semibold">{data.subsidiary}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500 text-sm">Reporting Period</p>
                    <p className="text-xl font-semibold">
                      {data.startMonth} {data.startYear} – {data.endMonth} {data.endYear}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <Tabs defaultValue="environmental" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100/50 p-1">
                  <TabsTrigger value="environmental" className="gap-2">
                    <Leaf className="w-4 h-4" /> Environmental
                  </TabsTrigger>
                  <TabsTrigger value="social" className="gap-2">
                    <Users className="w-4 h-4" /> Social
                  </TabsTrigger>
                  <TabsTrigger value="governance" className="gap-2">
                    <Building2 className="w-4 h-4" /> Governance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="environmental" className="space-y-6">
                  <Accordion type="multiple" defaultValue={["ghg-emissions"]} className="space-y-4">
                    {/* GHG EMISSIONS TAB */}
                    <AccordionItem
                      value="ghg-emissions"
                      className="border rounded-lg px-4 bg-gray-50/30"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          <span className="text-lg font-bold">GHG Emissions</span>
                          <Badge variant="outline" className="ml-2">
                            {formatNumberShort(assessmentData.totalEmission) || "0.00"} tCO₂e
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-6 space-y-8">
                        {/* Scope 1 */}
                        <div className="space-y-6">
                          <SectionHeader icon={ChevronRight} title="Scope 1: Direct Emissions" />
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <MetricCard title="Stationary Sources">
                              <DataList
                                label="Electricity & Heat"
                                data={[
                                  ...(scope1.stationarySources?.electricityHeat?.dieselGenerators ||
                                    []),
                                  ...(scope1.stationarySources?.electricityHeat?.gasTurbines || []),
                                ]}
                              />
                              <DataList
                                label="Industrial Processes"
                                data={scope1.stationarySources?.industrialProcesses?.boilerFurnaces}
                              />
                              <DataList
                                label="Oil & Gas"
                                data={scope1.stationarySources?.oilGasOperations?.onShoreProduction}
                              />
                              {!scope1.stationarySources?.electricityHeat?.dieselGenerators
                                ?.length &&
                                !scope1.stationarySources?.electricityHeat?.gasTurbines?.length &&
                                !scope1.stationarySources?.industrialProcesses?.boilerFurnaces
                                  ?.length &&
                                !scope1.stationarySources?.oilGasOperations?.onShoreProduction
                                  ?.length && (
                                  <p className="text-xs text-gray-400 italic">No data recorded</p>
                                )}
                            </MetricCard>

                            <MetricCard title="Mobile Sources">
                              <DataList
                                label="Road Transport Fleet"
                                data={scope1.mobileSources?.roadTransport?.vehicleFleet}
                              />
                              <DataList
                                label="Cars and Buses"
                                data={scope1.mobileSources?.roadTransport?.carsBuses}
                              />
                              <DataList
                                label="Vehicle Equipment"
                                data={[
                                  ...(scope1.mobileSources?.vehicleEquipment?.forkliftFuelType ||
                                    []),
                                  ...(scope1.mobileSources?.vehicleEquipment?.heavyDutyFuelType ||
                                    []),
                                  ...(scope1.mobileSources?.vehicleEquipment?.tractorFuelType ||
                                    []),
                                ]}
                              />
                              <DataList
                                label="Aviation (Air)"
                                data={scope1.mobileSources?.marineAviation?.air}
                              />
                              <DataList
                                label="Marine (Water)"
                                data={scope1.mobileSources?.marineAviation?.marine}
                              />
                              {!scope1.mobileSources?.roadTransport?.vehicleFleet?.length &&
                                !scope1.mobileSources?.roadTransport?.carsBuses?.length &&
                                !scope1.mobileSources?.vehicleEquipment?.forkliftFuelType?.length &&
                                !scope1.mobileSources?.vehicleEquipment?.heavyDutyFuelType
                                  ?.length &&
                                !scope1.mobileSources?.vehicleEquipment?.tractorFuelType?.length &&
                                !scope1.mobileSources?.marineAviation?.air?.length &&
                                !scope1.mobileSources?.marineAviation?.marine?.length && (
                                  <p className="text-xs text-gray-400 italic">No data recorded</p>
                                )}
                            </MetricCard>

                            <MetricCard title="Processing & Fugitive">
                              <DataField
                                label="Cement Manufacturing"
                                value={scope1.processEmissions?.cementManufacturing?.cementQuantity}
                                unit="kg"
                              />
                              <DataField
                                label="Gas Flaring"
                                value={scope1.processEmissions?.gasFlaring?.gasVolume}
                                unit="m³"
                              />
                              <DataField
                                label="Venting Natural Gas"
                                value={
                                  scope1.fugitiveEmissions?.ventingNaturalGas?.volumeOfGasVented
                                }
                                unit="m³"
                              />
                              <DataField
                                label="HFC Leaks (Added)"
                                value={scope1.fugitiveEmissions?.hfcLeaks?.refrigerantAdded}
                                unit="kg"
                              />
                            </MetricCard>
                          </div>
                        </div>

                        {/* Scope 2 */}
                        <div className="space-y-6">
                          <SectionHeader icon={ChevronRight} title="Scope 2: Indirect Emissions" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MetricCard title="Location-Based">
                              <DataField
                                label="Electricity Consumed"
                                value={scope2.locationBased?.electricity?.electricityConsumed}
                                unit="kWh"
                              />
                              <DataField
                                label="Cooling Consumed"
                                value={scope2.locationBased?.cooling?.coolingConsumed}
                                unit="kWh"
                              />
                              <DataField
                                label="Heating Consumed"
                                value={scope2.locationBased?.heating?.heatingConsumed}
                                unit="kWh"
                              />
                              <DataField
                                label="Steam Consumed"
                                value={scope2.locationBased?.steam?.volume}
                                unit="kWh"
                              />
                            </MetricCard>
                            <MetricCard title="Market-Based">
                              <DataField
                                label="IPPs (Direct Purchase)"
                                value={scope2.marketBased?.ipps?.electricityConsumed}
                                unit="kWh"
                              />
                              <DataField
                                label="EACs / RECs"
                                value={scope2.marketBased?.eac?.gridElectricity}
                                unit="kWh"
                              />
                              <DataField
                                label="Residual Mix"
                                value={scope2.marketBased?.residual?.electricityConsumed}
                                unit="kWh"
                              />
                              <DataField
                                label="Cooling & Steam"
                                value={scope2.marketBased?.coolingSteam?.energyConsumed}
                                unit="kWh"
                              />
                            </MetricCard>
                          </div>
                        </div>

                        {/* Scope 3 */}
                        <div className="space-y-6">
                          <SectionHeader
                            icon={ChevronRight}
                            title="Scope 3: Value Chain Emissions"
                          />
                          <div className="space-y-4">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                              Upstream (Categories 1-8)
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <MetricCard title="Goods & Services">
                                <DataField
                                  label="Purchased Goods Mass"
                                  value={upstream.purchasedGoodsAndServices?.massOfGoods}
                                  unit="kg"
                                />
                                <DataField
                                  label="Capital Goods Cost"
                                  value={upstream.capitalGoods?.totalCost}
                                  unit="$"
                                />
                                <DataField
                                  label="Fuel/Energy Related"
                                  value={upstream.fuelEnergyRelatedActivities?.fuelVolume}
                                  unit="L/kWh"
                                />
                              </MetricCard>
                              <MetricCard title="Logistics & Waste">
                                <DataField
                                  label="Upstream Transport"
                                  value={
                                    upstream.upstreamTransportationDistribution?.massTransported
                                  }
                                  unit="kg"
                                />
                                <DataField
                                  label="Waste Generated"
                                  value={upstream.wasteGeneratedInOperations?.wasteWeight}
                                  unit="kg"
                                />
                                <DataField
                                  label="Waste Disposal Method"
                                  value={upstream.wasteGeneratedInOperations?.disposalMethod}
                                />
                              </MetricCard>
                              <MetricCard title="Travel & Commuting">
                                <DataField
                                  label="Business Travel (Flights)"
                                  value={upstream.businessTravel?.totalFlights}
                                />
                                <DataField
                                  label="Employee Commuting"
                                  value={upstream.employeeCommuting?.numberOfEmployees}
                                  unit="employees"
                                />
                                <DataField
                                  label="Upstream Leased Assets"
                                  value={upstream.upstreamLeasedAssets?.floorArea}
                                  unit="m²"
                                />
                              </MetricCard>
                            </div>

                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mt-6">
                              Downstream (Categories 9-15)
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <MetricCard title="Distribution">
                                <DataField
                                  label="Downstream Transport"
                                  value={
                                    downstream.downstreamTransportationDistribution
                                      ?.massOfProductsSold
                                  }
                                  unit="kg"
                                />
                                <DataField
                                  label="Processing Sold Products"
                                  value={downstream.processingSoldProducts?.processedQuantity}
                                  unit="kg"
                                />
                              </MetricCard>
                              <MetricCard title="Product Use">
                                <DataField
                                  label="Units Sold"
                                  value={downstream.useOfSoldProducts?.unitsSold}
                                />
                                <DataField
                                  label="Product Lifetime"
                                  value={downstream.useOfSoldProducts?.productLifetime}
                                  unit="years"
                                />
                              </MetricCard>
                              <MetricCard title="Leased & Finance">
                                <DataField
                                  label="Electricity Consumed"
                                  value={downstream.downstreamLeasedAssets?.electricityConsumed}
                                  unit="kWh"
                                />
                                <DataField
                                  label="Other Energy"
                                  value={downstream.downstreamLeasedAssets?.otherEnergyConsumed}
                                  unit="kWh"
                                />
                                <DataField
                                  label="Fuel Consumption"
                                  value={downstream.franchises?.fuelConsumption}
                                  unit="L"
                                />
                                <DataField
                                  label="Electricity Consumption"
                                  value={downstream.franchises?.electricityConsumption}
                                  unit="kWh"
                                />
                                <DataField
                                  label="Investments Amount"
                                  value={downstream.investments?.investmentAmount}
                                  unit="$"
                                />
                              </MetricCard>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* AIR QUALITY */}
                    <AccordionItem
                      value="air-quality"
                      className="border rounded-lg px-4 bg-gray-50/30"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Wind className="w-5 h-5 text-blue-500" />
                          <span className="text-lg font-bold">Air Quality</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-6">
                        <MetricCard>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <DataField
                              label="NOx Emissions"
                              value={
                                env.airQuality?.airPollutantEmissions?.calculated?.breakdown
                                  ?.oxidesOfNitrogen?.volume ??
                                env.airQuality?.airPollutantEmissions?.oxidesOfNitrogen
                              }
                              unit="t"
                            />
                            <DataField
                              label="SOx Emissions"
                              value={
                                env.airQuality?.airPollutantEmissions?.calculated?.breakdown
                                  ?.oxidesOfSulphur?.volume ??
                                env.airQuality?.airPollutantEmissions?.oxidesOfSulphur ??
                                env.airQuality?.airPollutantEmissions?.oxidesOfSuplphur
                              }
                              unit="t"
                            />
                            <DataField
                              label="Particulate Matter"
                              value={
                                env.airQuality?.airPollutantEmissions?.calculated?.breakdown
                                  ?.particulateMatter?.volume ??
                                env.airQuality?.airPollutantEmissions?.particulateMatter
                              }
                              unit="t"
                            />
                            <DataField
                              label="VOCs"
                              value={
                                env.airQuality?.airPollutantEmissions?.calculated?.breakdown
                                  ?.volatileOrganicCompounds?.volume ??
                                env.airQuality?.airPollutantEmissions?.volatileOrganicCompound ??
                                env.airQuality?.airPollutantEmissions?.volatileOrganicCompounds
                              }
                              unit="t"
                            />
                          </div>
                        </MetricCard>
                      </AccordionContent>
                    </AccordionItem>

                    {/* WATER MANAGEMENT */}
                    <AccordionItem
                      value="water-management"
                      className="border rounded-lg px-4 bg-gray-50/30"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-cyan-500" />
                          <span className="text-lg font-bold">Water Management</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-6 space-y-4">
                        <MetricCard title="Freshwater Management">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <DataField
                              label="Surface Water Withdrawal"
                              value={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.freshwaterWithdrawals?.withdrawalfromSurfaceWater
                              }
                              unit={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.freshwaterWithdrawals?.withdrawalfromSurfaceWaterUnit || "m³"
                              }
                            />
                            <DataField
                              label="Groundwater Withdrawal"
                              value={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.freshwaterWithdrawals?.withdrawalfromGroundwater
                              }
                              unit={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.freshwaterWithdrawals?.withdrawalfromGroundwaterUnit || "m³"
                              }
                            />
                            <DataField
                              label="Municipal/Other Sources"
                              value={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.freshwaterWithdrawals?.withdrawalfromMunicipalotherOtherSources
                              }
                              unit={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.freshwaterWithdrawals
                                  ?.withdrawalfromMunicipalotherOtherSourcesUnit || "m³"
                              }
                            />
                            <DataField
                              label="Total Water Consumed"
                              value={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.freshwaterWithdrawals?.totalWaterConsumed
                              }
                              unit={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.freshwaterWithdrawals?.totalWaterConsumedUnit || "m³"
                              }
                            />
                          </div>
                        </MetricCard>
                        <MetricCard title="Produced Water Management">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <DataField
                              label="Total Produced Water"
                              value={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.producedWaterManagement?.totalProducedWaterGenerated
                              }
                              unit={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.producedWaterManagement?.totalProducedWaterGeneratedUnit || "m³"
                              }
                            />
                            <DataField
                              label="Discharged to Surface"
                              value={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.producedWaterManagement?.volumeDischargedToSurface
                              }
                              unit={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.producedWaterManagement?.volumeDischargedToSurfaceUnit || "m³"
                              }
                            />
                            <DataField
                              label="Injected for Disposal"
                              value={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.producedWaterManagement?.volumeInjectedForDisposal
                              }
                              unit={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.producedWaterManagement?.volumeInjectedForDisposalUnit || "m³"
                              }
                            />
                            <DataField
                              label="Recycled/Reused"
                              value={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.producedWaterManagement?.volumeRecycledReused
                              }
                              unit={
                                env.waterManagement?.waterAndProducedWaterManagement
                                  ?.producedWaterManagement?.volumeRecycledReusedUnit || "m³"
                              }
                            />
                          </div>
                        </MetricCard>
                      </AccordionContent>
                    </AccordionItem>

                    {/* ACTIVITY METRICS */}
                    <AccordionItem
                      value="activity-metrics"
                      className="border rounded-lg px-4 bg-gray-50/30"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                          <span className="text-lg font-bold">Activity Metrics</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-6">
                        <MetricCard>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DataField
                              label="Production Volumes"
                              value={
                                assessmentData.foundationalData?.activityMetrics?.productionVolumes
                                  ?.volume
                              }
                              unit={
                                assessmentData.foundationalData?.activityMetrics?.productionVolumes
                                  ?.unit
                              }
                            />
                            <DataField
                              label="Offshore Sites"
                              value={
                                assessmentData.foundationalData?.activityMetrics?.offshoreSites
                                  ?.numberOfSites
                              }
                              unit="sites"
                            />
                            <DataField
                              label="Terrestrial Sites"
                              value={
                                assessmentData.foundationalData?.activityMetrics?.terrestrialSites
                                  ?.numberOfSites
                              }
                              unit="sites"
                            />
                          </div>
                        </MetricCard>
                      </AccordionContent>
                    </AccordionItem>

                    {/* BIODIVERSITY */}
                    <AccordionItem
                      value="biodiversity"
                      className="border rounded-lg px-4 bg-gray-50/30"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <TreeDeciduous className="w-5 h-5 text-emerald-600" />
                          <span className="text-lg font-bold">Biodiversity Impact</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 pb-6">
                        <MetricCard>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DataField
                              label="Sensitive Area Reserves"
                              value={
                                env.biodiversityImpact?.environmentalManagement
                                  ?.reservesInSensitiveAreas?.totalProvedReservesVolume ??
                                env.biodiversityImpact?.environmentalManagement
                                  ?.reservesInSensitiveAreas?.calculated?.total_reserves
                              }
                              unit="BOE"
                            />
                            <DataField
                              label="Number of Spills"
                              value={
                                env.biodiversityImpact?.environmentalManagement?.hydrocarbonSpills
                                  ?.numberOfSpills ??
                                env.biodiversityImpact?.environmentalManagement?.hydrocarbonSpills
                                  ?.calculated?.total_spills
                              }
                            />
                            <DataField
                              label="Spills in Sensitive Areas"
                              value={
                                env.biodiversityImpact?.environmentalManagement?.hydrocarbonSpills
                                  ?.spillsInSensitiveAreas
                              }
                            />
                            <DataField
                              label="ISO 14001 Certified"
                              value={
                                env.biodiversityImpact?.environmentalManagement
                                  ?.environmentalManagementPolicies?.isISO14001Certified
                                  ? "Yes"
                                  : "No"
                              }
                            />
                          </div>
                        </MetricCard>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>

                <TabsContent value="social" className="py-12 text-center text-gray-500 space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="w-12 h-12 text-gray-300" />
                    <h3 className="text-xl font-semibold">Social Pillar Data</h3>
                    <p className="max-w-md mx-auto text-sm">
                      Details for Social Capital, Human Capital, and Business Model innovation will
                      appear here once the assessments are completed.
                    </p>
                    <Badge variant="secondary" className="mt-4">
                      COMING SOON
                    </Badge>
                  </div>
                </TabsContent>

                <TabsContent
                  value="governance"
                  className="py-12 text-center text-gray-500 space-y-4"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Building2 className="w-12 h-12 text-gray-300" />
                    <h3 className="text-xl font-semibold">Governance Pillar Data</h3>
                    <p className="max-w-md mx-auto text-sm">
                      Details for Leadership & Governance, Business Ethics, and Risk Management will
                      appear here once the assessments are completed.
                    </p>
                    <Badge variant="secondary" className="mt-4">
                      COMING SOON
                    </Badge>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              {/* TOP 5 EMISSION SOURCES */}
              {assessmentData.topEmissionSources?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Top 5 Emission Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assessmentData.topEmissionSources.map((s: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-semibold">{s.source}</p>
                              <p className="text-sm text-gray-600">
                                {s.scope} → {s.group}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {formatNumberFull(s.emission)} tCO₂e
                            </p>
                            <p className="text-sm text-gray-600">{s.percentage}% of total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {allFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Supporting Documents ({allFiles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {allFiles.map((file, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedFile(file)}
                          className="group rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-teal-500 transition-all text-center"
                        >
                          <FileText className="w-10 h-10 mx-auto mb-2 text-gray-400 group-hover:text-teal-600" />
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{file.section}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.rejection_reason && (
                <Alert className="border-red-300 bg-red-50">
                  <XCircle className=" h-5 text-red-600" />
                  <AlertDescription className="text-red-700 font-medium">
                    Assessment Declined: {data.rejection_reason}
                  </AlertDescription>
                </Alert>
              )}

              {isAwaitingApproval && (
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <Button
                      onClick={handleApprove}
                      disabled={isActionLoading}
                      className="bg-green-600 text-white"
                    >
                      Approve
                    </Button>

                    {!showDeclineReason && (
                      <Button
                        onClick={handleOpenDecline}
                        disabled={isActionLoading}
                        variant="destructive"
                      >
                        Decline
                      </Button>
                    )}
                  </div>

                  {showDeclineReason && (
                    <div className="w-full md:w-2/3 bg-gray-50 p-4 rounded-md">
                      <textarea
                        rows={3}
                        className="w-full p-2 rounded border border-gray-300"
                        placeholder="Enter reason for rejection"
                        value={declineReason}
                        onChange={(e) => {
                          setDeclineReason(e.target.value);
                          setDeclineValidationError("");
                        }}
                        disabled={isActionLoading}
                      />
                      {declineValidationError && (
                        <div className="text-sm text-red-600 mt-2">{declineValidationError}</div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={handleCancelDecline}
                          variant="outline"
                          disabled={isActionLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmDecline}
                          variant="destructive"
                          disabled={isActionLoading}
                          className="text-white"
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {selectedFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{selectedFile.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>
              <div className="p-4">
                {selectedFile.url?.endsWith(".pdf") ? (
                  <iframe
                    src={selectedFile.url}
                    className="w-full h-[80vh]"
                    title={selectedFile.name}
                  />
                ) : (
                  <Image
                    src={selectedFile.url || ""}
                    alt={selectedFile.name}
                    width={800}
                    height={600}
                    className="max-w-full h-auto rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
