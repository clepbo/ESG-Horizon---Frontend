/**
 * Static total section counts for each ESG pillar.
 * These are the exact number of distinct form steps/pages in the assessment.
 *
 * E (Environmental):  GHG Scope1(10) + Scope2(8) + Scope3(15) + Air(1) + Water(2) + Biodiversity(3) = 39
 * S (Social + Human): Community Relations(4) + Security & Human Rights(3) + Workforce Health & Safety(2) = 9
 * G (Governance):     Reserves Valuation(4) + Business Ethics(2) + Critical Incident(2) + Legal & Regulatory(2) = 10
 * A (Activity Metrics): Production Volume + Offshore Sites + Terrestrial Sites = 3
 */
export const ESG_SECTION_COUNTS = {
  E: 39,
  S: 9,
  G: 10,
  activityMetrics: 3,
  total: 61, // E + S + G + activityMetrics
} as const;
