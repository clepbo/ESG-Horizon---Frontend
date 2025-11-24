// lib/lastSavedFormToRoute.ts
export const LAST_SAVED_FORM_MAP: Record<string, { view: string; form?: string; step?: string }> = {
  "ghg-scope1-stationary-electricityheat": {
    view: "ghg-stationary-sources",
    step: "electricity-heat",
  },
  "ghg-scope1-stationary-industrialprocess": {
    view: "ghg-stationary-sources",
    step: "industrial-processes",
  },
  "ghg-scope1-stationary-oilgasoperations": {
    view: "ghg-stationary-sources",
    step: "oil-gas",
  },
  "ghg-scope1-mobile-roadtransport": {
    view: "ghg-mobile-sources",
    step: "road-transport",
  },
  // Add more as needed
};
