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
import { calculateTCO2eForSource, formatTCO2eOutput } from "@/lib/utils";
import { useFormattedNumber } from "@/hooks/useNumberFormater";

export interface SourceData {
  id: string;
  fuelType: string;
  volume: string;
  unit: string;
  emissionFactor: number;
  source: string;
}

interface AddSourceProps {
  title?: string;
  fuelTypeOptions: FuelOption[];
  unitOptions: UnitOption[];
  sources: SourceData[];
  onSourcesChange: (sources: SourceData[]) => void;
  volumeLabel?: string;
  volumePlaceholder?: string;
  error?: string;
}

/**
 * Child row component — safe to call hooks here for each row
 */
function SourceRow({
  source,
  fuelTypeOptions,
  unitOptions,
  updateSource,
  removeSource,
  validateSource,
  errors,
  isEditing,
  tempEmissionFactor,
  setTempEmissionFactor,
  handleEditClick,
  handleSaveClick,
  handleCancelClick,
  handleResetClick,
}: {
  source: SourceData;
  fuelTypeOptions: FuelOption[];
  unitOptions: UnitOption[];
  updateSource: (id: string, field: keyof Omit<SourceData, "id">, value: string) => void;
  removeSource: (id: string) => void;
  validateSource: (source: SourceData) => void;
  errors: { [key: string]: string };
  isEditing: boolean;
  editingFactorId: string | null;
  tempEmissionFactor: number | null;
  setTempEmissionFactor: (n: number | null) => void;
  handleEditClick: (source: SourceData) => void;
  handleSaveClick: (id: string) => void;
  handleCancelClick: () => void;
  handleResetClick: (source: SourceData) => void;
}) {
  // Use the hook inside the child component — stable and allowed
  const formatted = useFormattedNumber(source.volume);

  const tCO2e = calculateTCO2eForSource({
    volume: source.volume,
    emissionFactor: source.emissionFactor,
  });
  const formattedTCO2e = formatTCO2eOutput(tCO2e);

  return (
    <Card key={source.id} className="p-4 relative">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor={`fuel-type-${source.id}`}>Fuel Type</Label>
            <Select
              value={source.fuelType}
              onValueChange={(value) => updateSource(source.id, "fuelType", value)}
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
                  <Label className="flex items-center gap-1 text-xs">
                    <span>Emission Factor:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-6 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The standard value is used by default. </p>
                          <p>You can edit it to align with</p>
                          <p>your specific supplier&apos;s data.</p>
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
                              e.target.value === "" ? null : parseFloat(e.target.value)
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
                      <span className="text-sm text-gray-700">kgCO₂/unit</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs">{source.emissionFactor || 2.68} kgCO₂/unit</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(source)}
                        className="ml-2 h-auto text-primary text-sm"
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
                        Editing emission factors will change your total emissions calculations. Only
                        update with verified data to ensure accurate reporting.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveClick(source.id)}
                        className="text-xs text-white"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelClick}
                        className="text-xs border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}

                <p className="text-xs text-muted-foreground">
                  Source: {source.source || "IPCC 2006, Vintage: 2006"}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor={`volume-${source.id}`}>Volume of Fuel Consumed</Label>
            <div className="relative pb-5">
              <Input
                id={`volume-${source.id}`}
                type="text"
                placeholder="Enter total volume consumed"
                value={formatted.displayValue}
                onChange={(e) => {
                  formatted.handleChange(e.target.value);
                  // Save raw to the parent source state
                  updateSource(source.id, "volume", formatted.rawValue);
                }}
                onBlur={() => validateSource(source)}
                className={errors[`${source.id}-volume`] ? "border-destructive" : ""}
              />

              {tCO2e > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute bottom-0 right-0 flex items-center pr-1.5 cursor-pointer transform translate-y-3"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        style={{ zIndex: 20 }}
                      >
                        <span className="text-sm font-semibold bg-teal-100 text-teal-700 px-2 py-1 rounded-full whitespace-nowrap shadow-md border border-teal-200">
                          {formattedTCO2e}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border border-teal-600 text-teal-800 shadow-lg">
                      <p className="font-semibold text-center">Volume Emission</p>
                      <p className="text-xs">
                        This is the tCO₂e emission calculated from the volume and emission factor
                        here.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {errors[`${source.id}-volume`] && (
              <p className="text-sm text-destructive mt-1">{errors[`${source.id}-volume`]}</p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor={`unit-${source.id}`}>Unit</Label>
            <Select
              value={source.unit}
              onValueChange={(value) => updateSource(source.id, "unit", value)}
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
}

export function AddSource({
  fuelTypeOptions,
  unitOptions,
  sources,
  onSourcesChange,
  // volumeLabel = "Volume of Fuel Consumed",
  // volumePlaceholder = "Enter total volume consumed",
  error,
}: AddSourceProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editingFactorId, setEditingFactorId] = useState<string | null>(null);
  const [tempEmissionFactor, setTempEmissionFactor] = useState<number | null>(null);

  // const calculatedEmissions = useMemo(() => {
  //   return sources.reduce(
  //     (acc, source) => {
  //       acc[source.id] = calculateTCO2eForSource({
  //         volume: source.volume,
  //         emissionFactor: source.emissionFactor,
  //       });
  //       return acc;
  //     },
  //     {} as Record<string, number>
  //   );
  // }, [sources]);

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

  const updateSource = (id: string, field: keyof Omit<SourceData, "id">, value: string) => {
    onSourcesChange(
      sources.map((source) => {
        if (source.id === id) {
          const updatedSource = { ...source, [field]: value };
          if (field === "fuelType") {
            const selectedFuel = fuelTypeOptions.find((option) => option.value === value);
            updatedSource.emissionFactor = selectedFuel?.emissionFactor || 0;
            updatedSource.source = selectedFuel?.source || "IPCC 2006, Vintage: 2006";
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
    const factorToSave = tempEmissionFactor ?? 0;

    onSourcesChange(
      sources.map((source) => {
        if (source.id === id) {
          const selectedFuel = fuelTypeOptions.find((option) => option.value === source.fuelType);
          const defaultFactor = selectedFuel?.emissionFactor ?? 0;

          return {
            ...source,
            emissionFactor: factorToSave,

            source:
              factorToSave !== defaultFactor
                ? "Custom emission factor (user edited)"
                : selectedFuel?.source || "IPCC 2006, Vintage: 2006",
          };
        }
        return source;
      })
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
      fuelTypeOptions.find((option) => option.value === source.fuelType)?.emissionFactor || 2.68;
    setTempEmissionFactor(defaultFactor);
  };

  const validateSource = (source: SourceData) => {
    const newErrors = { ...errors };
    if (!source.volume || isNaN(Number(source.volume)) || Number(source.volume) <= 0) {
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
              <SourceRow
                key={source.id}
                source={source}
                fuelTypeOptions={fuelTypeOptions}
                unitOptions={unitOptions}
                updateSource={updateSource}
                removeSource={removeSource}
                validateSource={validateSource}
                errors={errors}
                isEditing={isEditing}
                editingFactorId={editingFactorId}
                tempEmissionFactor={tempEmissionFactor}
                setTempEmissionFactor={setTempEmissionFactor}
                handleEditClick={handleEditClick}
                handleSaveClick={handleSaveClick}
                handleCancelClick={handleCancelClick}
                handleResetClick={handleResetClick}
              />
            );
          })
        )}
      </div>

      <div className="flex justify-center">
        <Button type="button" variant="outline" onClick={addSource} className="w-full border">
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>
    </div>
  );
}
