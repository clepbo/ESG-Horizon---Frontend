import { allFuels } from "@/lib/fuelDataFile";
import { formatNumberShort } from "@/lib/numberFormat";
import { StatusDot } from "./StatusDot";
import type { SectionStatus } from "@/lib/assessmentStatusUtils";

interface SourceEntryCardProps {
  number: string;
  title: string;
  data: any;
  status?: SectionStatus;
}

/**
 * Renders an individual fuel/emission source entry card.
 * Shows: Fuel Type, Volume, Unit, Emission Factor, Computed Emissions (highlighted).
 * Status is auto-derived: green if computedEmission exists, yellow if data is partial.
 */
export function SourceEntryCard({ number, title, data, status }: SourceEntryCardProps) {
  if (!data) return null;

  const fuelLabel = allFuels.find((f) => f.value === data.fuelType)?.label || data.fuelType || "—";
  const volume = data.volume || data.fuelVolume || data.quantity;
  const unit = data.unit || data.fuelUnit || "";
  const emissionFactor = data.emissionFactor;
  const source = data.source || data.emissionFactorSource || "";
  const computedEmission = data.computedEmission ?? data.emission ?? data.calculated?.emission;

  const effectiveStatus: SectionStatus =
    status ?? (computedEmission != null ? "submitted" : "in-progress");

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-800">
          {number} {title}
        </span>
        <StatusDot status={effectiveStatus} />
      </div>

      {/* Fields */}
      <div className="p-4 flex flex-wrap gap-3">
        <Field label="Fuel Type" value={fuelLabel} />
        <Field
          label="Volume of Fuel Consu..."
          value={volume != null ? `${formatNumberShort(volume)} ${unit}` : undefined}
        />
        <Field label="Unit" value={unit} />
        <Field
          label="Emission Factor"
          value={
            emissionFactor != null
              ? `${formatNumberShort(emissionFactor)} kgCO₂e/${unit || "unit"}${source ? ` (${source})` : ""}`
              : undefined
          }
        />
        <HighlightField
          label="Computed Emissions"
          value={
            computedEmission != null ? `${formatNumberShort(computedEmission)} tCO₂e` : undefined
          }
        />
      </div>
    </div>
  );
}

/* ── Inline field helpers ── */

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1 p-2.5 rounded-md border border-gray-100 bg-gray-50/50 min-w-[140px] flex-1">
      <span className="text-xs text-gray-600 font-semibold">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value || "—"}</span>
    </div>
  );
}

function HighlightField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1 p-2.5 rounded-md border border-teal-200 bg-teal-50/50 min-w-[140px] flex-1">
      <span className="text-xs text-teal-700 font-semibold">{label}</span>
      <span className="text-sm font-bold text-teal-800">{value || "—"}</span>
    </div>
  );
}
