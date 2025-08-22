"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, FileText } from "lucide-react"
import { ElectricityHeatForm } from "./electricity-heat-form"
import { IndustrialProcessesForm } from "./industrial-processes-form"
import { OilGasSubsidiariesForm } from "./oil-gas-subsidiaries-form"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { useAssessment } from "@/contexts/assessment-context"

interface StationarySourcesFormProps {
  onBack: () => void
}

const steps = ["Electricity & Heat", "Industrial Processes", "Oil & Gas"]

export function StationarySourcesForm({ onBack }: StationarySourcesFormProps) {
  const { state } = useAssessment()
  const [currentStep, setCurrentStep] = useState<"overview" | "electricity-heat" | "industrial-processes" | "oil-gas">(
    "overview",
  )
  const [showSuccess, setShowSuccess] = useState(false)

  const handleStepNavigation = (step: string) => {
    switch (step) {
      case "electricity-heat":
        setCurrentStep("electricity-heat")
        break
      case "industrial-processes":
        setCurrentStep("industrial-processes")
        break
      case "oil-gas":
        setCurrentStep("oil-gas")
        break
      default:
        setCurrentStep("overview")
    }
  }

  const handleBackToOverview = () => {
    setCurrentStep("overview")
  }

  const handleSubmitSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setCurrentStep("overview")
    }, 3000)
  }

  const getStepStatus = (stepKey: string) => {
    const data = state.assessmentData.stationarySources
    switch (stepKey) {
      case "electricity-heat":
        return data?.electricityHeat?.dieselVolume || data?.electricityHeat?.gasVolume ? "completed" : "pending"
      case "industrial-processes":
        return data?.industrialProcesses?.selectedFuelType && data?.industrialProcesses?.fuelVolume
          ? "completed"
          : "pending"
      case "oil-gas":
        return data?.oilGasSubsidiaries?.selectedFuelType && data?.oilGasSubsidiaries?.fuelVolume
          ? "completed"
          : "pending"
      default:
        return "pending"
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12 animate-in fade-in-50 duration-500">
            <CardContent className="space-y-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto animate-in zoom-in-50 duration-700" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Assessment Completed!</h2>
                <p className="text-muted-foreground">You have successfully completed the assessment of this metric.</p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                  onClick={() => setCurrentStep("overview")}
                >
                  Continue with Assessment
                </Button>
                <Button variant="outline" onClick={onBack} className="transition-colors bg-transparent">
                  Return to Assessment Hub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === "electricity-heat") {
    return (
      <ElectricityHeatForm onBack={handleBackToOverview} onNext={() => handleStepNavigation("industrial-processes")} />
    )
  }

  if (currentStep === "industrial-processes") {
    return (
      <IndustrialProcessesForm
        onBack={() => handleStepNavigation("electricity-heat")}
        onNext={() => handleStepNavigation("oil-gas")}
      />
    )
  }

  if (currentStep === "oil-gas") {
    return (
      <OilGasSubsidiariesForm
        onBack={() => handleStepNavigation("industrial-processes")}
        onSubmit={handleSubmitSuccess}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 bg-transparent transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Stationary Sources</h1>
          <p className="text-muted-foreground">Report emissions from fixed combustion sources</p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator steps={steps} currentStep={0} />

        {/* Form Steps */}
        <div className="grid gap-4">
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
            onClick={() => handleStepNavigation("electricity-heat")}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStepStatus("electricity-heat") === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>Electricity & Heat Generation</span>
                  </div>
                </div>
                <span className="text-sm font-normal text-muted-foreground">Step 1 of 3</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Input data for diesel powered generators and gas fired turbines</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-accent/50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
            onClick={() => handleStepNavigation("industrial-processes")}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStepStatus("industrial-processes") === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>Industrial Processes</span>
                  </div>
                </div>
                <span className="text-sm font-normal text-muted-foreground">Step 2 of 3</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Specify boiler and furnace fuel types and consumption volumes</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-accent/50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
            onClick={() => handleStepNavigation("oil-gas")}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStepStatus("oil-gas") === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>Oil & Gas Subsidiaries</span>
                  </div>
                </div>
                <span className="text-sm font-normal text-muted-foreground">Step 3 of 3</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Report fuel usage at oil production facilities</p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        {state.lastSaved && (
          <Card className="bg-green-50 border-green-200 animate-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-800">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Progress saved: {state.lastSaved.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
