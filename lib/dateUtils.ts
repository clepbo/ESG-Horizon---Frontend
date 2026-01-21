/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format date as "20 JAN 2026"
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string in "DAY MONTH YEAR" format or "—" if invalid
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "—";

  const day = date.getDate();
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format date with leading zero for day (e.g., "01 JAN 2026")
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string with padded day or "—" if invalid
 */
export const formatDatePadded = (dateString: string | undefined | null): string => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format date with full month name (e.g., "20 January 2026")
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string with full month name or "—" if invalid
 */
export const formatDateFull = (dateString: string | undefined | null): string => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "—";

  const day = date.getDate();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format date with time (e.g., "20 JAN 2026, 14:30")
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string with time or "—" if invalid
 */
export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "—";

  const day = date.getDate();
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};
