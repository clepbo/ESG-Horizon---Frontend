"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Trash2, Plus, AlertTriangle, RefreshCcw, Info } from "lucide-react";
import type { FuelOption, UnitOption } from "@/lib/fuelDataFile";

export interface SourceData {
  id: string;
  fuelType: string;
  volume: string;
  unit: string;
  emissionFactor: number;
  source: string;
}

interface AddSourceProps {
  title: string;
  fuelTypeOptions: FuelOption[];
  unitOptions: UnitOption[];
  sources: SourceData[];
  onSourcesChange: (sources: SourceData[]) => void;
  volumeLabel?: string;
  volumePlaceholder?: string;
  error?: string;
}

export function AddSource({
  fuelTypeOptions,
  unitOptions,
  sources,
  onSourcesChange,
  volumeLabel = "Volume of Fuel Consumed",
  volumePlaceholder = "Enter total volume consumed",
  error,
}: AddSourceProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editingFactorId, setEditingFactorId] = useState<string | null>(null);
  const [tempEmissionFactor, setTempEmissionFactor] = useState<number | null>(
    null
  );

  const addSource = () => {
    const defaultFuelType = fuelTypeOptions[0] || {
      value: "",
      emissionFactor: 0,
      source: "IPCC 2006, Vintage: 2006",
    };
    const newSource: SourceData = {
      id: Date.now().toString(),
      fuelType: defaultFuelType.value,
      volume: "",
      unit: unitOptions[0]?.value || "",
      emissionFactor: defaultFuelType.emissionFactor,
      source: defaultFuelType.source,
    };
    onSourcesChange([...sources, newSource]);
  };

  const removeSource = (id: string) => {
    onSourcesChange(sources.filter((source) => source.id !== id));
    const newErrors = { ...errors };
    delete newErrors[`${id}-volume`];
    setErrors(newErrors);
    if (editingFactorId === id) {
      setEditingFactorId(null);
      setTempEmissionFactor(null);
    }
  };

  const updateSource = (
    id: string,
    field: keyof Omit<SourceData, "id">,
    value: string
  ) => {
    onSourcesChange(
      sources.map((source) => {
        if (source.id === id) {
          const updatedSource = { ...source, [field]: value };
          if (field === "fuelType") {
            const selectedFuel = fuelTypeOptions.find(
              (option) => option.value === value
            );
            updatedSource.emissionFactor = selectedFuel?.emissionFactor || 0;
            updatedSource.source =
              selectedFuel?.source || "IPCC 2006, Vintage: 2006";
            setEditingFactorId(null);
            setTempEmissionFactor(null);
          }
          return updatedSource;
        }
        return source;
      })
    );
    if (field === "volume" && errors[`${id}-volume`]) {
      const newErrors = { ...errors };
      delete newErrors[`${id}-volume`];
      setErrors(newErrors);
    }
  };

  const handleEditClick = (source: SourceData) => {
    setEditingFactorId(source.id);
    setTempEmissionFactor(source.emissionFactor);
  };

  const handleSaveClick = (id: string) => {
    onSourcesChange(
      sources.map((source) =>
        source.id === id
          ? { ...source, emissionFactor: tempEmissionFactor || 0 }
          : source
      )
    );
    setEditingFactorId(null);
    setTempEmissionFactor(null);
  };

  const handleCancelClick = () => {
    setEditingFactorId(null);
    setTempEmissionFactor(null);
  };

  const handleResetClick = (source: SourceData) => {
    const defaultFactor =
      fuelTypeOptions.find((option) => option.value === source.fuelType)
        ?.emissionFactor || 2.68;
    setTempEmissionFactor(defaultFactor);
  };

  const validateSource = (source: SourceData) => {
    const newErrors = { ...errors };
    if (
      !source.volume ||
      isNaN(Number(source.volume)) ||
      Number(source.volume) <= 0
    ) {
      newErrors[`${source.id}-volume`] = "Please enter a valid positive number";
    }
    setErrors(newErrors);
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-4">
        {sources.length === 0 ? (
          <p className="text-muted-foreground text-center">
            No sources added yet. Click &quot;Add Source&quot; to begin.
          </p>
        ) : (
          sources.map((source) => {
            const isEditing = editingFactorId === source.id;

            return (
              <Card key={source.id} className="p-4 relative">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor={`fuel-type-${source.id}`}>
                        Fuel Type
                      </Label>
                      <Select
                        value={source.fuelType}
                        onValueChange={(value) =>
                          updateSource(source.id, "fuelType", value)
                        }
                      >
                        <SelectTrigger id={`fuel-type-${source.id}`}>
                          <SelectValue placeholder="Select type of fuel" />
                        </SelectTrigger>
                        <SelectContent>
                          {fuelTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {source.fuelType && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Label className="flex items-center gap-1">
                              <span>Emission Factor:</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-6 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      The standard value is used by default.{" "}
                                    </p>
                                    <p>You can edit it to align with </p>
                                    <p>
                                      your specific supplier&apos;s data data.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>

                            {isEditing ? (
                              <>
                                <div className="relative flex-grow">
                                  <Input
                                    type="number"
                                    value={tempEmissionFactor ?? ""}
                                    onChange={(e) =>
                                      setTempEmissionFactor(
                                        e.target.value === ""
                                          ? null
                                          : parseFloat(e.target.value)
                                      )
                                    }
                                    className="pr-5 "
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleResetClick(source)}
                                    className="absolute inset-y-0 right-0 flex items-center justify-center p-2 text-muted-foreground hover:text-primary"
                                  >
                                    <RefreshCcw className="h-4 w-4" />
                                  </Button>
                                </div>
                                <span className="text-sm text-gray-700">
                                  kgCO₂/litre
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-sm">
                                  {source.emissionFactor || 2.68} kgCO₂/litre
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(source)}
                                  className="ml-2 h-auto text-primary"
                                >
                                  Edit Factor
                                </Button>
                              </>
                            )}
                          </div>

                          {isEditing && (
                            <>
                              <div className="flex items-start text-yellow-600 bg-yellow-500/10 p-2 rounded-md border border-yellow-600">
                                <AlertTriangle className="h-4 w-4 mt-1 mr-2 flex-shrink-0" />
                                <p className="text-xs">
                                  Editing emission factors will change your
                                  total emissions calculations. Only update with
                                  verified data to ensure accurate reporting.
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveClick(source.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelClick}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Source:{" "}
                            {source.source || "IPCC 2006, Vintage: 2006"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor={`volume-${source.id}`}>
                        {volumeLabel}
                      </Label>
                      <Input
                        id={`volume-${source.id}`}
                        type="number"
                        placeholder={volumePlaceholder}
                        value={source.volume}
                        onChange={(e) =>
                          updateSource(source.id, "volume", e.target.value)
                        }
                        onBlur={() => validateSource(source)}
                        className={
                          errors[`${source.id}-volume`]
                            ? "border-destructive"
                            : "border-neutral-200"
                        }
                      />
                      {errors[`${source.id}-volume`] && (
                        <p className="text-sm text-destructive mt-1">
                          {errors[`${source.id}-volume`]}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor={`unit-${source.id}`}>Unit</Label>
                      <Select
                        value={source.unit}
                        onValueChange={(value) =>
                          updateSource(source.id, "unit", value)
                        }
                      >
                        <SelectTrigger id={`unit-${source.id}`}>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSource(source.id)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addSource}
          className="w-full border"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>
    </div>
  );
}
