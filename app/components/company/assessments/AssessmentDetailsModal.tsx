"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { ScrollArea } from "../../ui/scroll-area";
import { Progress } from "@/app/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { CheckCircle2, XCircle, FileText, AlertCircle, Clock, Zap } from "lucide-react";
import Image from "next/image";
import { useAssessment } from "@/services/hooks/assessment.hooks";
import type { Assessment } from "./AssessmentTable";
import { Separator } from "@/app/components/ui/separator";

interface FileWithMeta {
  name: string;
  url?: string;
  section: string;
}

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

  if (!open || !assessment) return null;

  if (isLoading || !fullAssessment?.data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Card className="w-full max-w-4xl p-12">
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
  extractFiles(scope1.stationarySources?.industrialProcess, "Stationary - Industrial");
  extractFiles(scope1.stationarySources?.oilGasOperations, "Stationary - Oil & Gas");
  extractFiles(scope1.mobileSources?.roadTransport, "Mobile - Road Transport");
  extractFiles(scope1.mobileSources?.vehicleEquipment, "Mobile - Vehicle Equipment");
  extractFiles(scope1.mobileSources?.marineAviation, "Mobile - Marine/Aviation");
  extractFiles(scope1.processEmissions, "Process Emissions");
  extractFiles(scope1.fugitiveEmissions, "Fugitive Emissions");

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

  const renderSources = (sources: any[] = [], title: string) => {
    if (!sources.length) return null;
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" /> {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Emission Factor</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.fuelType}</TableCell>
                  <TableCell>{Number(s.volume).toLocaleString()}</TableCell>
                  <TableCell>{s.unit}</TableCell>
                  <TableCell>{s.emissionFactor}</TableCell>
                  <TableCell className="text-xs text-gray-500">{s.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-6xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <Card className="w-full max-w-7xl shadow-2xl bg-white">
          <CardHeader className="sticky top-0 bg-white border-b z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Assessment Details</h2>
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  {statusInfo.icon} {statusInfo.label}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="h-[80vh]">
            <CardContent className="p-6 space-y-8">
              {/* HERO SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-linear-to-br from-teal-500 to-emerald-600 text-white">
                  <CardContent className="p-6">
                    <p className="text-teal-100 text-sm">Total Emissions</p>
                    <p className="text-4xl font-bold">
                      {assessmentData.totalEmission?.toFixed(2) || "0.00"} tCO₂e
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

              {/* DETAILED DATA - Scope 1 */}
              <div className="space-y-8">
                <h3 className="text-xl font-bold">Detailed Data Entry</h3>

                {/* Stationary Sources - Electricity & Heat */}
                {scope1.stationarySources?.electricityHeat && (
                  <>
                    {renderSources(
                      scope1.stationarySources.electricityHeat.dieselGenerators,
                      "Diesel-Powered Generators"
                    )}
                    {renderSources(
                      scope1.stationarySources.electricityHeat.gasTurbines,
                      "Gas-Fired Turbines"
                    )}
                  </>
                )}

                {/* Add more groups as you build them */}
                {/* Mobile Sources, Process Emissions, Fugitive Emissions — same pattern */}
              </div>

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
                            <p className="text-2xl font-bold">{s.emission.toFixed(2)} tCO₂e</p>
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
