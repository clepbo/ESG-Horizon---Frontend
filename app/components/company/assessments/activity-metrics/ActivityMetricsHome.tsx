"use client";

import { useState } from "react";
import { DefaultActivityComponent } from "./DefaultActivityCommponent";
import { ProductionVolume } from "./ProductionVolume";
import { OffshoreSites } from "./OffschoreSites";
import { TerrestialSites } from "./TerrestialSites";

export function ActivityMetricHome() {
  const [current, setCurrent] = useState(0);

  function backToActivityMetrics() {
    setCurrent(0);
  }

  if (current === 0) return <DefaultActivityComponent handleClick={setCurrent} />;

  if (current === 1) {
    return (
      <ProductionVolume
        onBack={() => setCurrent(0)}
        onContinueToNextAssessment={() => setCurrent(2)}
        stepIndex={1}
        totalSteps={3}
        backToActivityMetrics={backToActivityMetrics}
      />
    );
  }

  if (current === 2) {
    return (
      <OffshoreSites
        onBack={() => setCurrent(1)}
        onContinueToNextAssessment={() => setCurrent(3)}
        stepIndex={2}
        totalSteps={3}
        backToActivityMetrics={backToActivityMetrics}
      />
    );
  }

  if (current === 3) {
    return (
      <TerrestialSites
        onBack={() => setCurrent(2)}
        stepIndex={3}
        totalSteps={3}
        backToActivityMetrics={backToActivityMetrics}
      />
    );
  }

  return null;
}
