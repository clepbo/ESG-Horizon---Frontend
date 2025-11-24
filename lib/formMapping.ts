// lib/formMapping.ts
export const FORM_TO_VIEW_MAP: Record<string, { view: string; form?: string; step?: string }> = {
  "ghg-scope1-stationary-electricityheat": {
    view: "ghg",
    form: "stationary-sources",
    step: "electricity-heat",
  },
  "ghg-scope1-stationary-industrialprocess": {
    view: "ghg",
    form: "stationary-sources",
    step: "industrial-process",
  },
  "ghg-scope1-stationary-oilgasoperations": {
    view: "ghg",
    form: "stationary-sources",
    step: "oil-gas-operations",
  },
  "ghg-scope1-mobile-roadtransport": {
    view: "ghg",
    form: "mobile-sources",
    step: "road-transport",
  },
  // Add all your forms here
};