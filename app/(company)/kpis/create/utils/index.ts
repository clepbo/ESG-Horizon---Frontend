export function CalculateEmissionPercentage(percent: number, baseAmount: number) {
  if (isNaN(percent) || isNaN(baseAmount)) return 0;
  const result = baseAmount * (1 - percent / 100);
  return parseFloat(result.toFixed(2)); // returns number
}

export function calculateTotal(baseAmount: number, target: number) {
  if (isNaN(baseAmount) || isNaN(target)) return 0;
  const result = target - baseAmount;
  return parseFloat(result.toFixed(2)); // returns number
}

export function calculateTimelineYear(baseYear: number, targetYear: number) {
  const result = targetYear - baseYear;
  return Number(result).toFixed(0);
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Format month for display in baseline dropdown (e.g. "January" → "Jan", 1 → "Jan"). */
export function toShortMonth(month: string | number | null | undefined): string {
  if (month == null || month === "") return "";
  const n = typeof month === "number" ? month : parseInt(String(month), 10);
  if (!Number.isNaN(n) && n >= 1 && n <= 12) return SHORT_MONTHS[n - 1];
  const s = String(month).trim();
  if (s.length <= 3) return s;
  return s.slice(0, 3);
}
