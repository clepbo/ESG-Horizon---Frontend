import { DataField } from "./DataField";
import type { DataFieldItem } from "./types";

interface DataFieldGridProps {
  fields: DataFieldItem[];
  columns?: 2 | 3 | 4 | 5;
}

const colsClass = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
} as const;

export function DataFieldGrid({ fields, columns = 3 }: DataFieldGridProps) {
  // If any field is a paragraph, force the whole grid to single-column.
  // Otherwise the small neighbours next to the (col-span-full) paragraph
  // would either leave an empty hole on row 1 or get vertically stretched
  // by the paragraph's row height. Single-column stacks them naturally.
  const hasParagraph = fields.some((f) => f.paragraph);
  const gridCols = hasParagraph ? "grid-cols-1" : colsClass[columns];

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {fields.map((field) => (
        <DataField
          key={field.label}
          label={field.label}
          value={field.value}
          unit={field.unit}
          highlight={field.highlight}
          isBoolean={field.isBoolean}
          paragraph={field.paragraph}
        />
      ))}
    </div>
  );
}
