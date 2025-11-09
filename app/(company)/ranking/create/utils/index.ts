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
