import { formatNumberFull, formatNumberShort } from "@/lib/numberFormat";

export function formatNumberFigures(num: number): string {
  if (isNaN(num)) return "0";
  return formatNumberShort(num);
}

export function formatWithCommas(num: number | null | undefined): string {
  return formatNumberFull(num);
}
