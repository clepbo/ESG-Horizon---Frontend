/**
 * Compute the percentage of emission change per year.
 *
 * @param {number} currentValue - Current emission value
 * @param {number} baselineValue - Baseline emission value
 * @param {number} currentYear - Current year
 * @param {number} targetYear - Target year for reduction
 * @returns {number} Percentage change in emissions per year
 */
export function emissionPercentagePerTime(currentValue: number, baselineValue : number, currentYear: number, targetYear: number) {
  if (baselineValue === 0) {
    throw new Error("Baseline value cannot be zero.");
  }

  // Total percentage change from baseline to current
  const totalChange = ((currentValue - baselineValue) / baselineValue) * 100;

  // Number of years elapsed
  const yearsElapsed = currentYear - targetYear;
  if (yearsElapsed === 0) {
    throw new Error("Current year and target year cannot be the same.");
  }

  // Average percentage change per year
  return totalChange / yearsElapsed;
}

