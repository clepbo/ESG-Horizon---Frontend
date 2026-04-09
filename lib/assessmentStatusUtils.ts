export type SectionStatus = "submitted" | "in-progress" | "not-started";

/**
 * Determine status of a form section based on submission state and saved data.
 * Accepts either a boolean or the raw section data (which is checked via hasUserData
 * to distinguish the empty initialState skeleton from real user input).
 */
export function getFormSectionStatus(
  submittedGroups: string[],
  groupKey: string,
  sectionData: any
): SectionStatus {
  if (submittedGroups.includes(groupKey)) return "submitted";
  if (hasUserData(sectionData)) return "in-progress";
  return "not-started";
}

/**
 * Return an inline border-left color string for a given status.
 * Teal = submitted, Yellow = in-progress, Transparent = not-started.
 */
export function getSectionBorderColor(status: SectionStatus): string {
  if (status === "submitted") return "#2dd4bf";
  if (status === "in-progress") return "#facc15";
  return "transparent";
}

/**
 * Traverse a nested object by an array of keys.
 * e.g. resolveDataPath(data, ["environment", "ghg"]) → data.environment.ghg
 */
export function resolveDataPath(data: any, path: string[]): any {
  return path.reduce((current, key) => current?.[key], data);
}

/**
 * Keys stamped by the backend calculator or system metadata — never entered by the user.
 * Excluding these prevents empty-but-computed sections from appearing "In Progress".
 */
const COMPUTED_KEYS = new Set([
  "progress",
  "totalEmission",
  "status",
  "lastUpdated",
  "id",
  "createdAt",
  "updatedAt",
  "_id",
]);

/**
 * Recursively check whether an object tree contains any real user-entered data.
 * Returns false for the empty skeleton in initialState (empty strings, zeros,
 * false booleans, empty arrays, and nested objects that only contain those).
 * Ignores backend-computed fields (progress, totalEmission, etc.).
 */
export function hasUserData(obj: any, key?: string): boolean {
  if (key && COMPUTED_KEYS.has(key)) return false;
  if (obj === null || obj === undefined || obj === "" || obj === 0 || obj === false) return false;
  if (Array.isArray(obj)) return obj.length > 0;
  if (typeof obj === "object") {
    return Object.entries(obj).some(([k, v]) => hasUserData(v, k));
  }
  return true;
}
