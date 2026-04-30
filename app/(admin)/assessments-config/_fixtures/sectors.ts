import type { Industry, PillarSection, Sector } from "./types";
import { scope1Groups } from "./groups";

/* ----------------------------------------------------------------- *
 * Pillar template — the 5 ESG pillars are the same shape per industry,
 * just with different topic content. We seed 'Extractives & Minerals
 * Processing > Oil & Gas - Exploration & Production' fully and stub the
 * rest. Every Industry below gets the same 5 empty pillars so the tree
 * still expands.
 * ----------------------------------------------------------------- */

const emptyPillars = (): PillarSection[] => [
  { id: "p_env", key: "environmental", topics: [] },
  { id: "p_social", key: "socialCapital", topics: [] },
  { id: "p_human", key: "humanCapital", topics: [] },
  { id: "p_business", key: "businessModel", topics: [] },
  { id: "p_lead", key: "leadershipGovernance", topics: [] },
];

const oilGasExpProdPillars: PillarSection[] = [
  {
    id: "p_env_oge",
    key: "environmental",
    topics: [
      {
        id: "t_ghg",
        name: "Greenhouse Gas Emissions",
        description: "Total emissions from Subsidiaries and supply chains, measured in CO₂ equivalent",
        ifrsCode: "IFRS: EM-EP-110a",
        formCountLabel: "Scope 1, 2, and 3 · 12 sub-metrics",
        subMetrics: [
          {
            id: "sm_scope1",
            name: "Scope 1",
            category: "DIRECT EMISSION",
            leafLabels: ["Stationary Sources", "Mobile Sources", "Process Emissions", "Fugitive Emissions"],
            groups: scope1Groups,
          },
          {
            id: "sm_scope2",
            name: "Scope 2",
            category: "PURCHASED ENERGY",
            leafLabels: ["Location-Based Scope 2 Emissions", "Market-Based Scope 2 Emissions"],
          },
          {
            id: "sm_scope3",
            name: "Scope 3",
            category: "VALUE CHAIN",
            leafLabels: ["Upstream Emissions (Categories 1-8)", "Downstream Emissions (Categories 9-15)"],
          },
        ],
      },
      {
        id: "t_air",
        name: "Air Quality",
        description: "Emissions of criteria air pollutants from operations.",
        ifrsCode: "IFRS: EM-EP-140a.1 - 140a.4",
        formCountLabel: "1 form",
        subMetrics: [{ id: "sm_air_1", name: "Criteria Air Pollutants" }],
      },
      {
        id: "t_water",
        name: "Water and Wastewater Management",
        description: "Freshwater withdrawals, produced water and chemical disclosure.",
        ifrsCode: "IFRS: EM-EP-140.1 - 140a.4",
        formCountLabel: "4 form",
        subMetrics: [
          { id: "sm_w_1", name: "Freshwater Withdrawals" },
          { id: "sm_w_2", name: "Produced Water Management" },
          { id: "sm_w_3", name: "Hydraulic Fracturing — Water Quality" },
          { id: "sm_w_4", name: "Chemical Disclosure" },
        ],
      },
      {
        id: "t_bio",
        name: "Biodiversity Impacts",
        description: "Impacts on ecosystems, habitats and protected areas.",
        ifrsCode: "IFRS: EM-EP-160a.1 - 160a.3",
        formCountLabel: "3 form",
        subMetrics: [
          { id: "sm_b_1", name: "Hydrocarbon Spills" },
          { id: "sm_b_2", name: "Environmental Management Policies" },
          { id: "sm_b_3", name: "Reserves in Sensitive Areas" },
        ],
      },
    ],
  },
  {
    id: "p_social_oge",
    key: "socialCapital",
    topics: [
      {
        id: "t_security",
        name: "Security, Human Rights & Rights of Indigenous Peoples",
        description: "Operations in conflict zones, indigenous land, and human rights engagement.",
        ifrsCode: "IFRS: EM-EP-210a.1 - 210a.3",
        formCountLabel: "3 form",
        subMetrics: [
          { id: "sm_sec_1", name: "Operations in Conflict Zones" },
          { id: "sm_sec_2", name: "Reserves in / Near Indigenous Land" },
          { id: "sm_sec_3", name: "Human Rights Engagement Processes" },
        ],
      },
      {
        id: "t_community",
        name: "Community Relations",
        description: "Community risk and opportunity management, contributions, and dispute resolution.",
        ifrsCode: "IFRS: EM-EP-210b.1, 210b.2, NOA.S1, NOA.S2",
        formCountLabel: "4 form",
        subMetrics: [
          { id: "sm_com_1", name: "Community Risk & Opportunity Management" },
          { id: "sm_com_2", name: "HCDT Contribution" },
          { id: "sm_com_3", name: "Community Dispute Resolution" },
          { id: "sm_com_4", name: "Operational Delays" },
        ],
      },
    ],
  },
  {
    id: "p_human_oge",
    key: "humanCapital",
    topics: [
      {
        id: "t_workforce",
        name: "Workforce Health & Safety",
        description: "Worker health, safety performance and risk management.",
        ifrsCode: "IFRS: EM-EP-320a.1, 320a.2",
        formCountLabel: "2 form",
        subMetrics: [
          { id: "sm_h_1", name: "Workforce Health & Safety" },
          { id: "sm_h_2", name: "Health & Safety Performance" },
        ],
      },
    ],
  },
  {
    id: "p_business_oge",
    key: "businessModel",
    topics: [
      {
        id: "t_reserves",
        name: "Reserves Valuation & Capital Expenditures",
        description: "Reserves sensitivity, embedded carbon, renewable investment and capex strategy.",
        ifrsCode: "IFRS: EM-EP-420a.1 - 420a.4",
        formCountLabel: "4 form",
        subMetrics: [
          { id: "sm_r_1", name: "Reserves Sensitivity to Carbon Pricing" },
          { id: "sm_r_2", name: "Embedded Carbon in Reserves" },
          { id: "sm_r_3", name: "Renewable Energy Investment" },
          { id: "sm_r_4", name: "Capital Expenditure Strategy" },
        ],
      },
      {
        id: "t_ethics",
        name: "Business Ethics & Transparency",
        description: "Anti-corruption management and reserves in high-corruption-risk jurisdictions.",
        ifrsCode: "IFRS: EM-EP-510a.1, 510a.2",
        formCountLabel: "2 form",
        subMetrics: [
          { id: "sm_e_1", name: "Reserves in Countries with High Corruption Risk" },
          { id: "sm_e_2", name: "Anti-Corruption Management System" },
        ],
      },
    ],
  },
  {
    id: "p_lead_oge",
    key: "leadershipGovernance",
    topics: [
      {
        id: "t_critical",
        name: "Critical Incident Risk Management",
        description: "Process safety events and catastrophic risk management systems.",
        ifrsCode: "IFRS: EM-EP-540a.1, 540a.2",
        formCountLabel: "2 form",
        subMetrics: [
          { id: "sm_c_1", name: "Process Safety Events" },
          { id: "sm_c_2", name: "Catastrophic Risk Management Systems" },
        ],
      },
      {
        id: "t_regulatory",
        name: "Management of the Legal & Regulatory Environment",
        description: "Board oversight and public policy engagement.",
        ifrsCode: "IFRS: EM-EP-530a.1, NOA.G1",
        formCountLabel: "2 form",
        subMetrics: [
          { id: "sm_reg_1", name: "Board / Management Oversight" },
          { id: "sm_reg_2", name: "Public Policy Engagement" },
        ],
      },
    ],
  },
];

/* ----------------------------------------------------------------- *
 * Industries — 'Oil & Gas - Exploration & Production' is fully wired;
 * other industries get the empty pillar template so the tree still
 * expands.
 * ----------------------------------------------------------------- */

const stubIndustry = (id: string, code: string, name: string, description: string): Industry => ({
  id,
  code,
  sasbCode: code,
  name,
  description,
  pillars: emptyPillars(),
});

const extractivesIndustries: Industry[] = [
  stubIndustry(
    "i_coal",
    "EM-CO",
    "Coal Operations",
    "The Coal Operations Industry includes entities that mine coal and those that manufacture coal products."
  ),
  stubIndustry(
    "i_construction",
    "EM-CM",
    "Construction Materials",
    "Construction Materials entities have global operations and produce construction materials for sale to construction entities or wholesale distributors."
  ),
  stubIndustry(
    "i_iron",
    "EM-IS",
    "Iron & Steel Producers",
    "The Iron & Steel Producers Industry primarily consists of entities producing iron and steel in mills and foundries."
  ),
  stubIndustry(
    "i_metals",
    "EM-MM",
    "Metals & Mining",
    "The Metals & Mining Industry is involved in extracting metals and minerals; processing, smelting, and manufacturing metals; mining trade; and providing mining support activities."
  ),
  {
    id: "i_oge",
    code: "EM-EP",
    sasbCode: "SASB-EP",
    name: "Oil & Gas - Exploration & Production",
    description: "Companies involved in the exploration, extraction, and production of crude oil and natural gas.",
    pillars: oilGasExpProdPillars,
  },
  stubIndustry(
    "i_oils_mid",
    "EM-MD",
    "Oil & Gas - Midstream",
    "Oil & Gas - Midstream entities transport petroleum and refined-product fuels from one place to another via pipeline, rail or barge."
  ),
  stubIndustry(
    "i_oils_ref",
    "EM-RM",
    "Oil & Gas - Refining & Marketing",
    "Oil & Gas - Refining & Marketing entities refine petroleum products, market and distribute them to wholesale and retail customers."
  ),
  stubIndustry(
    "i_oils_svc",
    "EM-SV",
    "Oil & Gas - Services",
    "Companies that provide contract drilling, contract pumping, and other oilfield support services for upstream oil and gas operations."
  ),
];

/* ----------------------------------------------------------------- *
 * Sectors — 11 real seeded sectors, with industry counts mocked from
 * what the Figma shows on the overview tile.
 * ----------------------------------------------------------------- */

export const sectors: Sector[] = [
  {
    id: "s_consumer",
    code: "CG",
    sasbCode: "SASB-CG",
    name: "Consumer Goods",
    description:
      "Covers industries that produce or sell consumer goods and services, including retail, apparel, household products, and leisure services.",
    industries: Array.from({ length: 10 }, (_, i) =>
      stubIndustry(`i_cg_${i}`, "CG-" + String(i + 1).padStart(2, "0"), `Consumer Goods Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
  {
    id: "s_extractives",
    code: "EM",
    sasbCode: "SASB-EM",
    name: "Extractives & Minerals Processing",
    description:
      "Includes industries involved in the exploration, extraction, and processing of natural resources such as oil, gas, metals, and minerals.",
    industries: extractivesIndustries,
  },
  {
    id: "s_financials",
    code: "FN",
    sasbCode: "SASB-FN",
    name: "Financials",
    description:
      "Covers industries that provide financial services including banking, insurance, asset management, investment services, and commerce finance.",
    industries: Array.from({ length: 6 }, (_, i) =>
      stubIndustry(`i_fn_${i}`, "FN-" + String(i + 1).padStart(2, "0"), `Financials Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
  {
    id: "s_food",
    code: "FB",
    sasbCode: "SASB-FB",
    name: "Food & Beverage",
    description:
      "Includes industries engaged in the production, processing, and distribution of food, beverages, and agricultural products.",
    industries: Array.from({ length: 6 }, (_, i) =>
      stubIndustry(`i_fb_${i}`, "FB-" + String(i + 1).padStart(2, "0"), `Food & Beverage Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
  {
    id: "s_health",
    code: "HC",
    sasbCode: "SASB-HC",
    name: "Health Care",
    description:
      "Includes industries that provide healthcare services, medical equipment, pharmaceuticals, and biotechnology solutions.",
    industries: Array.from({ length: 6 }, (_, i) =>
      stubIndustry(`i_hc_${i}`, "HC-" + String(i + 1).padStart(2, "0"), `Health Care Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
  {
    id: "s_infra",
    code: "IF",
    sasbCode: "SASB-IF",
    name: "Infrastructure",
    description:
      "Covers industries responsible for the development, operation, and management of physical infrastructure such as real estate, utilities, and construction.",
    industries: Array.from({ length: 6 }, (_, i) =>
      stubIndustry(`i_if_${i}`, "IF-" + String(i + 1).padStart(2, "0"), `Infrastructure Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
  {
    id: "s_renewable",
    code: "RR",
    sasbCode: "SASB-RR",
    name: "Renewable Resources & Alternative Energy",
    description:
      "Comprises industries involved in renewable energy generation and the sustainable management of agriculture, forestry, and bioenergy.",
    industries: Array.from({ length: 7 }, (_, i) =>
      stubIndustry(`i_rr_${i}`, "RR-" + String(i + 1).padStart(2, "0"), `Renewable Resources Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
  {
    id: "s_resource",
    code: "RT",
    sasbCode: "SASB-RT",
    name: "Resource Transformation",
    description:
      "Includes industries that transform raw materials into finished or intermediate goods, such as chemicals, industrial manufacturing, and materials.",
    industries: Array.from({ length: 9 }, (_, i) =>
      stubIndustry(`i_rt_${i}`, "RT-" + String(i + 1).padStart(2, "0"), `Resource Transformation Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
  {
    id: "s_services",
    code: "SV",
    sasbCode: "SASB-SV",
    name: "Services",
    description:
      "Covers industries that provide commercial, professional, and consumer services such as consulting, education, and waste management.",
    industries: Array.from({ length: 6 }, (_, i) =>
      stubIndustry(`i_sv_${i}`, "SV-" + String(i + 1).padStart(2, "0"), `Services Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
  {
    id: "s_tech",
    code: "TC",
    sasbCode: "SASB-TC",
    name: "Technology & Communications",
    description:
      "Includes industries focused on software, hardware, telecommunications, media, and digital services.",
    industries: Array.from({ length: 6 }, (_, i) =>
      stubIndustry(`i_tc_${i}`, "TC-" + String(i + 1).padStart(2, "0"), `Technology Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
  {
    id: "s_transport",
    code: "TR",
    sasbCode: "SASB-TR",
    name: "Transportation",
    description:
      "Comprises industries involved in the movement of goods and people, including aviation, shipping, rail, trucking, and logistics services.",
    industries: Array.from({ length: 5 }, (_, i) =>
      stubIndustry(`i_tr_${i}`, "TR-" + String(i + 1).padStart(2, "0"), `Transportation Industry ${i + 1}`, "Industry description placeholder.")
    ),
  },
];
