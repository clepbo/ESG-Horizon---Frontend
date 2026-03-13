export type NumericInput = number | string | null | undefined;

function toNumber(value: NumericInput): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatWithIntl(
  value: number,
  options: Intl.NumberFormatOptions & { locale?: string } = {}
): string {
  const { locale = "en-US", ...fmtOptions } = options;
  return new Intl.NumberFormat(locale, fmtOptions).format(value);
}

/**
 * Full numeric formatting with thousands separators and up to 2 decimal places.
 * Ideal for tables and detail views where exact-ish values matter.
 */
export function formatNumberFull(
  value: NumericInput,
  options: Intl.NumberFormatOptions & { locale?: string } = {}
): string {
  const num = toNumber(value);
  if (num === null) return "0";

  const { minimumFractionDigits = 0, maximumFractionDigits = 2, useGrouping = true } = options;

  return formatWithIntl(num, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    ...options,
  });
}

export interface FormatNumberShortOptions extends Intl.NumberFormatOptions {
  locale?: string;
}

/**
 * Compact numeric formatting with M/B/T suffixes and up to 2 decimal places.
 * - Values below 1,000,000 are shown in full with commas (e.g. "1,500.99").
 * - Values from 1,000,000 upwards are shortened (e.g. "1.23M", "4.5B").
 */
export function formatNumberShort(
  value: NumericInput,
  options: FormatNumberShortOptions = {}
): string {
  const num = toNumber(value);
  if (num === null) return "0";

  const absNum = Math.abs(num);

  const { minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;

  // For thousands and below 1 million, show the full number with commas,
  // rounded to up to 2 decimal places.
  if (absNum < 1_000_000) {
    return formatNumberFull(num, {
      minimumFractionDigits,
      maximumFractionDigits,
      ...options,
    });
  }

  const baseOptions: Intl.NumberFormatOptions & { locale?: string } = {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping: true,
    ...options,
  };

  let scaled = num;
  let suffix = "";

  if (absNum >= 1_000_000_000_000) {
    scaled = num / 1_000_000_000_000;
    suffix = "T";
  } else if (absNum >= 1_000_000_000) {
    scaled = num / 1_000_000_000;
    suffix = "B";
  } else if (absNum >= 1_000_000) {
    scaled = num / 1_000_000;
    suffix = "M";
  }

  const formatted = formatWithIntl(scaled, baseOptions);
  return `${formatted}${suffix}`;
}

/**
 * Percentage formatting — value is already on the 0-100 scale (e.g. 90.8 → "90.80%").
 * Defaults to 2 decimal places. Pass decimals=0 for a compact integer display.
 */
export function formatPercent(value: NumericInput, decimals = 2): string {
  const num = toNumber(value);
  if (num === null) return "0.00%";
  const clamped = Math.min(Math.max(num, 0), 100);
  return `${formatNumberFull(clamped, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

/**
 * Compact currency formatting that builds on formatNumberShort.
 * Defaults to Naira (₦) since that's the dominant usage in this app.
 */
export function formatCurrencyCompact(
  value: NumericInput,
  currencySymbol = "₦",
  options: FormatNumberShortOptions = {}
): string {
  const numeric = toNumber(value);
  if (numeric === null) return `${currencySymbol} 0`;

  const compact = formatNumberShort(numeric, options);
  return `${currencySymbol} ${compact}`;
}
