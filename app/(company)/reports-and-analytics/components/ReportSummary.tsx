"use client"
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import BackButton from "@/app/components/ui/reusables/BackButton";
import CustomDropdown from "./CustomDropdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssessmentAll from "./AssessmentAll";


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
    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                <BackButton />

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
                            <div className="flex flex-col sm:flex-row gap-2 lg:justify-end ">
                                <Button className="bg-green-500 hover:bg-green-400 text-white px-2 rounded-lg">
                                    View Full Report
                                </Button>
                                <CustomDropdown
                                    options={[
                                        { label: "Download PDF", value: "pdf" },
                                        { label: "Download CSV", value: "csv" },
                                    ]}
                                    onChange={(value) => console.log(value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tab Navigation */}
                

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-[#F1FCF3] w-full h-auto p-2 ">
                        <TabsTrigger className="rounded-none cursor-pointer" value="all">View All</TabsTrigger>
                        <TabsTrigger className="rounded-none cursor-pointer" value="environment">Environment</TabsTrigger>
                        <TabsTrigger className="rounded-none cursor-pointer" value="social">Social</TabsTrigger>
                        <TabsTrigger className="rounded-none cursor-pointer" value="governance">Governance</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all"> <AssessmentAll /> </TabsContent>
                    <TabsContent value="environment">View environment reports here.</TabsContent>
                    <TabsContent value="social">View social reports here.</TabsContent>
                    <TabsContent value="governance">View governance reports here.</TabsContent>
                </Tabs>

               
            </div>
        </div>
    );
};

export default ReportSummary;