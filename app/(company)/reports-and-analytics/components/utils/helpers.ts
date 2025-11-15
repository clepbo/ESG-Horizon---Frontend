export function formatNumberWithCommas(number: number): string {
  // Round to 2 decimal places and convert to string
  const fixedNumber = (Math.round((number + Number.EPSILON) * 100) / 100).toString();

  // Split integer and decimal parts
  const parts = fixedNumber.split(".");

  // Format integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Join back together
  return parts.join(".");
}
