"use client"
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import BackButton from "@/app/components/ui/reusables/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssessmentAll, { data, PillarAssessmentCard } from "./AssessmentAll";
import Link from "next/link";
import { exportPNG, generatePDF } from "./exportFiles";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { useState } from "react";


interface ReportSummaryProps {
    reportingPeriod?: string;
    subsidiary?: string;
    status?: string;
    progress?: number;
    totalEmissions?: number;
    scope1?: number;
    scope2?: number;
    scope3?: number;

}


const ReportSummary = (props: ReportSummaryProps) => {
    const [selected, setSelected] = useState<string | undefined>(undefined)

    async function exportfile(value: string) {
        if (value === "pdf") {

            await generatePDF("section", "esg-detail");
        } else if (value === "png") {
            await exportPNG("section")
        }
        setSelected(undefined)
    }
    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="my-4">
                <BackButton />
            </div>
            <div className="max-w-7xl mx-auto space-y-6" id="section">


                {/* Main Report Card */}
                <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6 lg:p-8">
                        <h1 className="text-2xl lg:text-3xl font-semibold text-foreground mb-8">
                            ESG Summary Report
                        </h1>
                        <div className="grid grid-flow-col auto-cols-auto items-start gap-4">

                            <div className="space-y-2 ">
                                <h3 className="text-sm font-medium text-foreground ">Reporting Period</h3>
                                <p className="text-sm text-muted-foreground"> {props.reportingPeriod} </p>
                            </div>


                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-foreground">Subsidiary</h3>
                                <span className="text-sm text-muted-foreground"> {props.subsidiary} </span>
                            </div>


                            <div className="space-y-2 ">
                                <h3 className="text-sm font-medium text-foreground">Status</h3>
                                <div className="">
                                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-medium`}>
                                        {props.status}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Progress value={props.progress} className="h-2" />
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{props.progress} %</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-2 lg:justify-end no-export" id="hide1">
                                <Button className="bg-green-500 hover:bg-green-400 text-white px-2 rounded-lg">
                                    <Link href={`/reports-and-analytics/1/report`}>
                                        View Full Report
                                    </Link>
                                </Button>


                                <Select value={selected} onValueChange={exportfile}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Export file" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf"> PDF</SelectItem>
                                        <SelectItem value="png">PNG</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tab Navigation */}


                <Tabs defaultValue="all" className="w-full no-export">
                    <TabsList className="bg-[#F1FCF3] w-full h-auto p-2 ">
                        <TabsTrigger className="rounded-none cursor-pointer" value="all">View All</TabsTrigger>
                        <TabsTrigger className="rounded-none cursor-pointer" value="environment">Environment</TabsTrigger>
                        <TabsTrigger className="rounded-none cursor-pointer" value="social">Social</TabsTrigger>
                        <TabsTrigger className="rounded-none cursor-pointer" value="governance">Governance</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all"> <AssessmentAll /> </TabsContent>
                    <TabsContent value="environment"> <PillarAssessmentCard heading="Environmental" data={data} /> </TabsContent>
                    <TabsContent value="social"> <PillarAssessmentCard heading="Social" data={data} /> </TabsContent>
                    <TabsContent value="governance"> <PillarAssessmentCard heading="Governance" data={data} /> </TabsContent>
                </Tabs>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Emission Summary */}
                    <Card className="bg-white shadow-sm border">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-medium text-foreground mb-6">Emission Summary</h3>
                            <div className="space-y-6">
                                {/* Scope 1 */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between bg-">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full "></div>
                                            <span className="text-sm font-medium text-foreground">Scope 1</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">16,300 tCO₂e (61%)</span>
                                    </div>
                                    <div className='w-full bg-green-200 h-2 rounded-2xl'>
                                        <Progress value={61} className="h-2 bg-green-500 rounded-2xl" style={{ width: '61%' }} />
                                    </div>
                                </div>

                                {/* Scope 2 */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full "></div>
                                            <span className="text-sm font-medium text-foreground">Scope 2</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">7,500 tCO₂e (28%)</span>
                                    </div>
                                    <div className='w-full bg-green-200 h-2 rounded-2xl'>
                                        <Progress value={28} className="h-2 bg-green-500 rounded-2xl" style={{ width: '28%' }} />
                                    </div>
                                </div>

                                {/* Scope 3 */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full"></div>
                                            <span className="text-sm font-medium text-foreground">Scope 3</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">3,030 tCO₂e (11%)</span>
                                    </div>

                                    <div className='w-full bg-green-200 h-2 rounded-2xl'>
                                        <Progress value={41} className="h-2 bg-green-500 rounded-2xl" style={{ width: '41%' }} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assessment Data Count */}
                    <Card className="bg-white border shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-medium text-foreground mb-6">Assessment Data Count</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">Scope 1 Sources</span>
                                    <span className="text-sm text-muted-foreground">85% Complete</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">Scope 2 Sources</span>
                                    <span className="text-sm text-muted-foreground">95% Complete</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">Scope 3 Sources</span>
                                    <span className="text-sm text-muted-foreground">60% Complete</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default ReportSummary;

