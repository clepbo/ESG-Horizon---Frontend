"use client"

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ChevronRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DefaultActivityComponent } from "./DefaultActivityCommponent";
import { ProductionVolume } from "./ProductionVolume";
import { OffshoreSites } from "./OffschoreSites";
import { TerrestialSites } from "./TerrestialSites";


export function ActivityMetricHome() {
    const router = useRouter();
    const [current, setCurrent] = useState(0)

    if(current === 0) {
        return (
            <DefaultActivityComponent handleClick={setCurrent} />
        )
    }
    if(current === 1){
        return (
            <ProductionVolume
                onBack={() => setCurrent(0)}
                onContinueToNextAssessment={() => setCurrent(2)}
                stepIndex={1}
                totalSteps={3}
                breadcrumb={[]}
            />
        )
    }
    if (current === 2){
        return (
            <OffshoreSites
                onBack={() => setCurrent(0)}
                onContinueToNextAssessment={() => setCurrent(3)}
                stepIndex={2}
                totalSteps={3}
                breadcrumb={[]}
            />
        )
    }
    if(current === 3){
        return <TerrestialSites />
    }
}