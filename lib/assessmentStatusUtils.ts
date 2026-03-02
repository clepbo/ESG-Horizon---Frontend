export type SectionStatus = "submitted" | "in-progress" | "not-started";

/**
 * Determine status of a form section based on submission state and saved data.
 */
export function getFormSectionStatus(
  submittedGroups: string[],
  groupKey: string,
  dataExists: boolean
): SectionStatus {
  if (submittedGroups.includes(groupKey)) return "submitted";
  if (dataExists) return "in-progress";
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
