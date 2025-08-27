/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { MethaneNitrousOxide } from "./MethaneNitrousOxide";
import { CO2Release } from "./CO2Release";
import { FertilizerEmissions } from "./FertilizerEmissions";
import { GasFlaring } from "./GasFlaring";
// import { EntericFermentation } from "./EntericFermentation";

export default function ProcessEmissionsFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleSubmit = () => {
    console.log("Process Emissions flow submitted");
    alert("Process Emissions data submitted successfully!");
    // Redirect or further logic here
  };

  const components = [
    <MethaneNitrousOxide
      key="methaneNitrousOxide"
      onBack={() => setCurrentStep(1)} // Exit flow if needed
      onNext={handleNext}
      stepIndex={1}
      totalSteps={5}
      percent={0}
    />,
    <CO2Release
      key="co2Release"
      onBack={handleBack}
      onNext={handleNext}
      stepIndex={2}
      totalSteps={5}
      percent={20}
    />,
    <FertilizerEmissions
      key="fertilizerEmissions"
      onBack={handleBack}
      onNext={handleNext}
      stepIndex={3}
      totalSteps={5}
      percent={40}
    />,
    <GasFlaring
      key="gasFlaring"
      onBack={handleBack}
      onNext={handleNext}
      stepIndex={4}
      totalSteps={5}
      percent={60}
    />,
    // <EntericFermentation
    //   key="entericFermentation"
    //   onBack={handleBack}
    //   onSubmit={handleSubmit}
    //   stepIndex={5}
    //   totalSteps={5}
    //   percent={80}
    // />,
  ];

  return <>{components[currentStep - 1]}</>;
}