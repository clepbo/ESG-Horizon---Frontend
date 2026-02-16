export function formatNumberFigures(num: number): string {
  if (isNaN(num)) return "0";

  const absNum = Math.abs(num);

  const formatWithCommas = (n: number): string =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  if (absNum >= 1_000_000_000_000) {
    return formatWithCommas(num / 1_000_000_000_000) + "T";
  }

  if (absNum >= 1_000_000_000) {
    return formatWithCommas(num / 1_000_000_000) + "B";
  }

  if (absNum >= 1_000_000) {
    return formatWithCommas(num / 1_000_000) + "M";
  }

  if (absNum >= 1_000) {
    return formatWithCommas(num / 1_000) + "K";
  }

  return formatWithCommas(num);
}

// export function formatWithCommas(num: number): string {
//   if (isNaN(num)) return "0";
//   return num.toLocaleString("en-US");
// }

export function formatWithCommas(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "0";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
