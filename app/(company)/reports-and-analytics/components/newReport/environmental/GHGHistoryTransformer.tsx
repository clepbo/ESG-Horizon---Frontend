interface GhgHistoryItem {
  score: number;
  period: string;
}

interface EmissionChartPoint {
  period: string;
  emissions: number;
}

export function GHGHistoryTransformer(ghgHistory?: GhgHistoryItem[]): EmissionChartPoint[] {
  if (!Array.isArray(ghgHistory)) return [];

  return ghgHistory.map((item) => ({
    period: shortenPeriod(item.period), // X-axis label
    emissions: Number(item.score) || 0, // Y-axis value
  }));
}

function parseDate(dateStr: string) {
  const [month, year] = dateStr.split(" ");
  return {
    month: month.slice(0, 3), // Jan, Feb, Mar
    year,
  };
}

function shortenDate(dateStr: string): string {
  const { month, year } = parseDate(dateStr);
  return `${month} ${year}`;
}

export function shortenPeriod(period: string): string {
  const [start, end] = period.split(" - ");

  if (!end) return shortenDate(start);

  const startDate = parseDate(start);
  const endDate = parseDate(end);

  // Same month & year → "Jan 2025"
  if (startDate.month === endDate.month && startDate.year === endDate.year) {
    return `${startDate.month} ${startDate.year}`;
  }

  // Same year → "Jan–Mar 2025"
  if (startDate.year === endDate.year) {
    return `${startDate.month}–${endDate.month} ${startDate.year}`;
  }

  // Different years → "Jan 2023 – Jan 2025"
  return `${startDate.month} ${startDate.year} – ${endDate.month} ${endDate.year}`;
}
