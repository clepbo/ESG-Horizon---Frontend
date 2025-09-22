"use client"
import { Card, CardContent } from "@/app/components/ui/card";
import BackButton from "@/app/components/ui/reusables/BackButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import AssessmentAllSkeleton from "./AssessmentAllSkeleton";

const ReportSummarySkeleton = () => {
    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <BackButton />

                {/* Main Report Card - Skeleton */}
                <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6 lg:p-8">
                        {/* Skeleton for main title */}
                        <Skeleton className="h-8 w-[300px] mb-8" /> 
                        <div className="grid grid-flow-col auto-cols-auto items-start gap-4">
                            {/* Skeleton for Reporting Period */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[140px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                            {/* Skeleton for Subsidiary */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[80px]" />
                                <Skeleton className="h-4 w-[120px]" />
                            </div>
                            {/* Skeleton for Status and Progress */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[60px]" />
                                <div className="flex items-center gap-1">
                                    <Skeleton className="h-2 w-[120px]" /> 
                                    <Skeleton className="h-4 w-[30px]" /> 
                                </div>
                            </div>
                            {/* Skeleton for Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 lg:justify-end">
                                <Skeleton className="h-9 w-[140px] rounded-lg" /> 
                                <Skeleton className="h-9 w-[140px] rounded-lg" /> 
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Skeleton for Tabs */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-[#F1FCF3] w-full h-auto p-2">
                        {/* Skeleton for Tab Triggers. You can also use actual TabsTrigger with Skeleton text */}
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 flex-1" />
                    </TabsList>
                    <TabsContent value="all">
                        {/* Add skeleton for the content of the AssessmentAll component here */}
                        <AssessmentAllSkeleton />
                        <Skeleton className="h-[200px] w-full" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ReportSummarySkeleton;