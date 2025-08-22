"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft } from "lucide-react"
import { useAssessment } from "@/contexts/assessment-context"

interface OilGasSubsidiariesFormProps {
  onBack: () => void
  onSubmit: () => void
}

const oilProductionFuelTypes = ["Natural Gas", "Diesel", "Heavy Fuel Oil", "Crude Oil", "Associated Gas"]

export function OilGasSubsidiariesForm({ onBack, onSubmit }: OilGasSubsidiariesFormProps) {
  const { state, dispatch } = useAssessment()
  const [selectedFuelType, setSelectedFuelType] = useState("")
  const [fuelVolume, setFuelVolume] = useState("")

  useEffect(() => {
    const existingData = state.assessmentData.stationarySources?.oilGasSubsidiaries
    if (existingData) {
      setSelectedFuelType(existingData.selectedFuelType || "")
      setFuelVolume(existingData.fuelVolume || "")
    }
  }, [state.assessmentData.stationarySources?.oilGasSubsidiaries])

  const handleSaveAndContinue = () => {
    dispatch({
      type: "UPDATE_STATIONARY_OIL_GAS",
      payload: { selectedFuelType, fuelVolume },
    })
    dispatch({ type: "SAVE_PROGRESS" })
  }

  const handleSubmit = () => {
    dispatch({
      type: "UPDATE_STATIONARY_OIL_GAS",
      payload: { selectedFuelType, fuelVolume },
    })
    dispatch({ type: "SAVE_PROGRESS" })
    onSubmit()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Oil & Gas Subsidiaries</h1>
          <p className="text-muted-foreground">Report fuel usage at oil production facilities</p>
          {state.lastSaved && <p className="text-sm text-green-600">Last saved: {state.lastSaved.toLocaleString()}</p>}
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Oil Production Facilities Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Type of Fuel Used at Oil Production Facilities</Label>
              <RadioGroup value={selectedFuelType} onValueChange={setSelectedFuelType}>
                {oilProductionFuelTypes.map((fuel) => (
                  <div key={fuel} className="flex items-center space-x-2">
                    <RadioGroupItem value={fuel} id={fuel} />
                    <Label htmlFor={fuel}>{fuel}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel-volume">Volume of Fuel Used for Heat and Boilers Production (Litres)</Label>
              <Input
                id="fuel-volume"
                type="number"
                placeholder="Enter volume in litres"
                value={fuelVolume}
                onChange={(e) => setFuelVolume(e.target.value)}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              <Button variant="outline" onClick={onBack}>
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
              >
                Save & Continue Later
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
