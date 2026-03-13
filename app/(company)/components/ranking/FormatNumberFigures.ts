import { formatNumberFull, formatNumberShort } from "@/lib/numberFormat";

export function formatNumberFigures(num: number): string {
  if (isNaN(num)) return "0.00";
  return formatNumberShort(num, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatWithCommas(num: number | null | undefined): string {
  return formatNumberFull(num, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
