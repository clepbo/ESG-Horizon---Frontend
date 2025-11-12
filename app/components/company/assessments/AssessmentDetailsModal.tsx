"use client";

import { useState, useMemo, JSX } from "react";
import { format } from "date-fns";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
  Zap,
  Car,
  Factory,
  Wind,
  AlertCircle,
  Lightbulb,
  Clock,
} from "lucide-react";

import {
  useApproveAssessment,
  useRejectAssessment,
  useAssessment,
} from "@/services/hooks/assessment.hooks";
import type { Assessment } from "./AssessmentTable";
import { ScrollArea } from "../../ui/scroll-area";
import Image from "next/image";

interface FileWithMeta {
  name: string;
  size?: number;
  url?: string;
  preview?: string;
  type?: string;
  section: string;
  field: string;
}

export default function AssessmentDetailsModal({
  open,
  onClose,
  assessment,
}: {
  open: boolean;
  onClose: () => void;
  assessment: Assessment | null;
}) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const approveMutation = useApproveAssessment();
  const rejectMutation = useRejectAssessment();

  const { data: fullAssessment, isLoading } = useAssessment(assessment?.id);

  const computed = fullAssessment?.assessmentData?.__computed || {};

  const assessmentData = useMemo(() => {
    return fullAssessment?.assessmentData || {};
  }, [fullAssessment?.assessmentData]);

  const totals = computed.totals;
  const scopeTotals = computed.scopeTotals;
  const breakdown = totals?.breakdown;

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = () => {
    approveMutation.mutate(assessment!.id, { onSuccess: onClose });
  };

  const handleReject = () => {
    if (!reason.trim()) return;
    rejectMutation.mutate(
      { assessmentId: assessment!.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason("");
          setShowReject(false);
          onClose();
        },
      }
    );
  };

  const allFiles = useMemo(() => {
    const files: FileWithMeta[] = [];

    const extract = (obj: any, section: string) => {
      if (!obj) return;

      if (obj.files && typeof obj.files === "object") {
        Object.entries(obj.files).forEach(([field, file]: [string, any]) => {
          if (file?.name) files.push({ ...file, section, field });
        });
      }

      if (Array.isArray(obj.additionalFields)) {
        obj.additionalFields.forEach((f: any) => {
          if (f.file?.name) files.push({ ...f.file, section, field: f.label || "Additional" });
        });
      }
    };

    extract(assessmentData.stationarySources?.electricityHeat, "Stationary - Electricity & Heat");
    extract(assessmentData.stationarySources?.industrialProcesses, "Stationary - Industrial");
    extract(assessmentData.stationarySources?.oilGasOperations, "Stationary - Oil & Gas");
    extract(assessmentData.mobileSources?.roadTransport, "Mobile - Road");
    extract(assessmentData.mobileSources?.vehicleEquipment, "Mobile - Equipment");
    extract(assessmentData.mobileSources?.marineAviation, "Mobile - Marine/Aviation");
    extract(assessmentData.processEmissions?.cementManufacturing, "Process - Cement");
    extract(assessmentData.processEmissions?.gasFlaring, "Process - Flaring");
    extract(assessmentData.fugitiveEmissions?.ventingNaturalGas, "Fugitive - Venting");
    extract(assessmentData.fugitiveEmissions?.hfcLeaks, "Fugitive - HFC");

    extract(assessmentData.electricity, "Scope 2 - Electricity");
    extract(assessmentData.cooling, "Scope 2 - Cooling");
    extract(assessmentData.steam, "Scope 2 - Steam");
    extract(assessmentData.heating, "Scope 2 - Heating");

    return files;
  }, [assessmentData]);

  const completeness = useMemo(() => {
    const sections = [
      "stationarySources",
      "mobileSources",
      "processEmissions",
      "fugitiveEmissions",
      "electricity",
      "cooling",
      "steam",
      "heating",
    ];

    const filled = sections.filter((s) => {
      const data = assessmentData[s];
      if (!data) return false;

      return Object.values(data).some((v) => {
        if (v === null || v === undefined) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "object") return Object.keys(v).length > 0;
        return !!v;
      });
    }).length;

    return {
      filled,
      total: sections.length,
      percent: Math.round((filled / sections.length) * 100),
    };
  }, [assessmentData]);

  type StatusKey =
    | "in_progress"
    | "awaiting_review"
    | "submitted_approved"
    | "approved"
    | "unapproved_rejected";

  const statusConfig: Record<StatusKey, { label: string; icon: JSX.Element; color: string }> = {
    in_progress: {
      label: "In Progress",
      icon: <Clock className="w-3 h-3" />,
      color: "bg-yellow-100 text-yellow-800",
    },
    awaiting_review: {
      label: "Awaiting Review",
      icon: <AlertCircle className="w-3 h-3" />,
      color: "bg-blue-100 text-blue-800",
    },
    submitted_approved: {
      label: "Approved",
      icon: <CheckCircle2 className="w-3 h-3" />,
      color: "bg-green-100 text-green-800",
    },
    approved: {
      label: "Approved",
      icon: <CheckCircle2 className="w-3 h-3" />,
      color: "bg-green-100 text-green-800",
    },
    unapproved_rejected: {
      label: "Rejected",
      icon: <XCircle className="w-3 h-3" />,
      color: "bg-red-100 text-red-800",
    },
  };

  const status = (fullAssessment?.status || assessment?.status) as StatusKey | undefined;

  const config =
    status && status in statusConfig
      ? statusConfig[status]
      : { label: status || "Unknown", icon: null, color: "bg-gray-100 text-gray-800" };

  const { label, icon, color } = config;

  if (!open || !assessment) return null;

  if (assessment.id && isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-7xl">
          <CardContent className="p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600">Loading assessment details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment.id) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-7xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-gray-700">Assessment ID not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-6xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <Card className="w-full max-w-7xl shadow-2xl bg-white">
          <CardHeader className="sticky top-0 bg-white border-b z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">Assessment Review</h2>
                <Badge className={`${color} flex items-center gap-1 text-xs font-medium`}>
                  {icon} {label}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[85vh]">
              <div className="p-6 space-y-6">
                {/* HERO SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <CardContent className="p-5">
                      <p className="text-emerald-100 text-sm">Total Emissions</p>
                      <p className="text-3xl font-bold">{totals?.sum.toFixed(4) || "0"} tCO₂e</p>
                      {scopeTotals && (
                        <p className="text-xs mt-1 opacity-90">
                          S1: {scopeTotals.scope1.toFixed(4)} | S2: {scopeTotals.scope2.toFixed(4)}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <p className="text-gray-500 text-sm">Data Completeness</p>
                      <div className="flex items-center gap-3 mt-1">
                        <Progress value={completeness.percent} className="flex-1 h-3" />
                        <span className="font-bold text-lg">{completeness.percent}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <p className="text-gray-500 text-sm">Supporting Files</p>
                      <p className="text-3xl font-bold flex items-center gap-2">
                        {allFiles.length} <FileText className="w-6 h-6 text-blue-600" />
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="scope1">Scope 1</TabsTrigger>
                    <TabsTrigger value="scope2">Scope 2</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>

                  {/* OVERVIEW */}
                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" /> Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">ID</p>
                            <p className="font-mono font-semibold">#{fullAssessment?.id}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Subsidiary</p>
                            <p className="font-medium">
                              {fullAssessment?.subsidiary || assessment.subsidiary}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Period</p>
                            <p className="text-xs">
                              {fullAssessment?.startMonth} {fullAssessment?.startYear} –{" "}
                              {fullAssessment?.endMonth} {fullAssessment?.endYear}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Computed</p>
                            <p className="text-xs">
                              {computed.computedAt
                                ? format(new Date(computed.computedAt), "PPp")
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {assessment.rejection_reason && (
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700 font-medium">
                          {assessment.rejection_reason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* SCOPE 1 */}
                  <TabsContent value="scope1">
                    {breakdown && (
                      <div className="space-y-4">
                        {Object.entries(breakdown).map(([key, data]: [string, any]) => {
                          if (!data.sum) return null;
                          const icons: Record<string, any> = {
                            stationarySources: <Zap className="w-5 h-5" />,
                            mobileSources: <Car className="w-5 h-5" />,
                            processEmissions: <Factory className="w-5 h-5" />,
                            fugitiveEmissions: <Wind className="w-5 h-5" />,
                          };
                          return (
                            <Card key={key} className="cursor-pointer" onClick={() => toggle(key)}>
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between text-lg">
                                  <span className="flex items-center gap-2">
                                    {icons[key]}{" "}
                                    {key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (s) => s.toUpperCase())}
                                  </span>
                                  {expanded[key] ? <ChevronUp /> : <ChevronDown />}
                                </CardTitle>
                              </CardHeader>
                              {expanded[key] && (
                                <CardContent>
                                  <p className="text-2xl font-bold">{data.sum.toFixed(4)} tCO₂e</p>
                                  <div className="mt-3 space-y-1 text-sm">
                                    {Object.entries(data)
                                      .filter(([k]) => k !== "sum")
                                      .map(([k, v]: [string, any]) => (
                                        <div key={k} className="flex justify-between">
                                          <span className="text-gray-600">
                                            {k.replace(/_/g, " ")}
                                          </span>
                                          <span className="font-medium">
                                            {v.value} {v.unit}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {/* SCOPE 2 */}
                  <TabsContent value="scope2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["electricity", "cooling", "steam", "heating"].map((key) => {
                        const data = assessmentData[key];
                        if (!data || !Object.values(data).some((v) => v)) return null;
                        return (
                          <Card key={key}>
                            <CardContent className="p-4">
                              <h4 className="font-semibold capitalize flex items-center gap-2">
                                {key === "electricity" && <Zap className="w-4 h-4" />}
                                {key}Consumed
                              </h4>
                              <p className="text-2xl font-bold">
                                {data[`${key}Consumed`] || data.volume || "0"}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>

                  {/* FILES */}
                  <TabsContent value="files">
                    {allFiles.length === 0 ? (
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>No files uploaded.</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {allFiles.map((file, i) => (
                          <Dialog key={i}>
                            <DialogTrigger asChild>
                              <div className="group cursor-pointer rounded-lg border p-3 hover:shadow-md transition bg-white">
                                {file.type?.startsWith("image/") ? (
                                  <div className="relative w-full h-20 rounded mb-2 overflow-hidden">
                                    <Image
                                      src={file.preview || file.url || ""}
                                      alt={file.name}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-20 flex items-center justify-center mb-2">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                                <p className="text-xs font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{file.section}</p>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>{file.name}</DialogTitle>
                              </DialogHeader>
                              {file.type?.startsWith("image/") ? (
                                <div className="relative w-full h-20 rounded mb-2 overflow-hidden">
                                  <Image
                                    src={file.preview || file.url || ""}
                                    alt={file.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <iframe src={file.url} className="w-full h-96" title={file.name} />
                              )}
                              <div className="mt-4 text-sm text-gray-600">
                                <p>
                                  <strong>Section:</strong> {file.section}
                                </p>
                                <p>
                                  <strong>Field:</strong> {file.field}
                                </p>
                                {file.size && (
                                  <p>
                                    <strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* ACTION BAR */}
                {status === "awaiting_review" && (
                  <Card className="border-t">
                    <CardContent className="pt-6">
                      {!showReject ? (
                        <div className="flex items-center justify-between">
                          <Alert className="flex-1 mr-4 border-blue-200 bg-blue-50">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <AlertDescription>
                              Approving finalizes the assessment and generates the official ESG
                              report.
                            </AlertDescription>
                          </Alert>
                          <div className="flex gap-3">
                            <Button
                              onClick={handleApprove}
                              disabled={approveMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              {approveMutation.isPending ? "Approving..." : "Approve"}
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => setShowReject(true)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Reason for rejection (required)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-24"
                          />
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="ghost"
                              onClick={() => setShowReject(false)}
                              disabled={rejectMutation.isPending}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleReject}
                              disabled={!reason.trim() || rejectMutation.isPending}
                            >
                              {rejectMutation.isPending ? "Submitting..." : "Confirm Rejection"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
