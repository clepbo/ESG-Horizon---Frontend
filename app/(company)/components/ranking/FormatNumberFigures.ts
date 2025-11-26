export function formatNumberFigures(num: number): string {
  if (isNaN(num)) return "0";

  const absNum = Math.abs(num);

  // Helper function to format numbers with commas
  const formatWithCommas = (n: number): string => {
    return n.toLocaleString();
  };

  // Start abbreviating only when the value is greater than or equal to 100,000
  if (absNum >= 1_000_000_000_000) {
    // Format number with commas, then abbreviate with 'T'
    return formatWithCommas(num / 1_000_000_000_000).replace(/\.0+$/, "") + "T";
  } else if (absNum >= 1_000_000_000) {
    // Format number with commas, then abbreviate with 'B'
    return formatWithCommas(num / 1_000_000_000).replace(/\.0+$/, "") + "B";
  } else if (absNum >= 1_000_000 && absNum >= 100_000) {
    // Format number with commas, then abbreviate with 'M' (only if above 100K)
    return formatWithCommas(num / 1_000_000).replace(/\.0+$/, "") + "M";
  } else if (absNum >= 1_000) {
    // Format number with commas, then abbreviate with 'K' (only if above 100K)
    return formatWithCommas(num / 1_000).replace(/\.0+$/, "") + "K";
  } else {
    // Format the number with commas if it's less than 1000
    return formatWithCommas(num);
  }
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
