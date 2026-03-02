import { formatNumberFull } from "@/lib/numberFormat";

export function formatNumberWithCommas(number: number): string {
  return formatNumberFull(number, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
