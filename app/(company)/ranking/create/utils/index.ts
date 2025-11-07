export function CalculateEmissionPercentage(percent: number, baseAmount: number) {
  const result = baseAmount * (1 - percent / 100);
  return Number(result.toFixed(2));
}

export function calculateTotal(baseAmount: number, target: number) {
  const result = target - baseAmount;
  return Number(result).toFixed(2);
}

export function calculateTimelineYear(baseYear: number, targetYear: number) {
  const result = targetYear - baseYear;
  return Number(result).toFixed(0);
}
