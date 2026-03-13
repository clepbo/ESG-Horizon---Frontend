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
  return (
    <div className={`grid ${colsClass[columns]} gap-4`}>
      {fields.map((field) => (
        <DataField key={field.label} label={field.label} value={field.value} unit={field.unit} highlight={field.highlight} isBoolean={field.isBoolean} />
      ))}
    </div>
  );
}
