"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft } from "lucide-react"
import { useAssessment } from "@/contexts/assessment-context"

interface IndustrialProcessesFormProps {
  onBack: () => void
  onNext: () => void
}

const fuelTypes = ["Natural Gas", "Diesel", "Heavy Fuel Oil", "Coal", "Biomass", "LPG"]

export function IndustrialProcessesForm({ onBack, onNext }: IndustrialProcessesFormProps) {
  const { state, dispatch } = useAssessment()
  const [selectedFuelType, setSelectedFuelType] = useState("")
  const [otherFuelType, setOtherFuelType] = useState("")
  const [fuelVolume, setFuelVolume] = useState("")

  useEffect(() => {
    const existingData = state.assessmentData.stationarySources?.industrialProcesses
    if (existingData) {
      setSelectedFuelType(existingData.selectedFuelType || "")
      setOtherFuelType(existingData.otherFuelType || "")
      setFuelVolume(existingData.fuelVolume || "")
    }
  }, [state.assessmentData.stationarySources?.industrialProcesses])

  const handleSaveAndContinue = () => {
    dispatch({
      type: "UPDATE_STATIONARY_INDUSTRIAL",
      payload: { selectedFuelType, otherFuelType, fuelVolume },
    })
    dispatch({ type: "SAVE_PROGRESS" })
  }

  const handleNext = () => {
    dispatch({
      type: "UPDATE_STATIONARY_INDUSTRIAL",
      payload: { selectedFuelType, otherFuelType, fuelVolume },
    })
    onNext()
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
          <h1 className="text-2xl font-bold text-foreground">Industrial Processes</h1>
          <p className="text-muted-foreground">Specify boiler and furnace fuel types and consumption volumes</p>
          {state.lastSaved && <p className="text-sm text-green-600">Last saved: {state.lastSaved.toLocaleString()}</p>}
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Boiler & Furnace Fuel Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Select Fuel Type</Label>
              <RadioGroup value={selectedFuelType} onValueChange={setSelectedFuelType}>
                {fuelTypes.map((fuel) => (
                  <div key={fuel} className="flex items-center space-x-2">
                    <RadioGroupItem value={fuel} id={fuel} />
                    <Label htmlFor={fuel}>{fuel}</Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {selectedFuelType === "other" && (
              <div className="space-y-2">
                <Label htmlFor="other-fuel">Specify Other Fuel Type</Label>
                <Input
                  id="other-fuel"
                  placeholder="Enter fuel type"
                  value={otherFuelType}
                  onChange={(e) => setOtherFuelType(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fuel-volume">Volume of Fuel Consumed (Litres)</Label>
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
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleNext}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
