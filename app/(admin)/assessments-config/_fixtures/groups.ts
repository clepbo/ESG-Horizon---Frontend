import type { Group } from "./types";

/**
 * Scope 1 groups for Oil & Gas — E&P, derived from real form copy.
 *
 * Each Group corresponds to a real backend `groupKey` (e.g.
 * `environment.ghg.scope1.stationarySources`). Sections within a group map
 * to per-form sub-keys (electricityHeat / industrialProcesses /
 * oilGasOperations under Stationary Sources, etc.).
 */

const fuelTypeOptions = [
  { id: "opt_diesel", label: "Diesel" },
  { id: "opt_petrol", label: "Petrol / Gasoline" },
  { id: "opt_naturalgas", label: "Natural Gas" },
  { id: "opt_lpg", label: "LPG" },
  { id: "opt_coal", label: "Coal" },
  { id: "opt_biomass", label: "Biomass" },
];

const unitOptions = [
  { id: "u_litre", label: "Litre" },
  { id: "u_kg", label: "Kilogram" },
  { id: "u_m3", label: "m³" },
  { id: "u_kwh", label: "kWh" },
  { id: "u_tonne", label: "Tonne" },
];

const hfcOptions = [
  { id: "hfc_134a", label: "R-134a" },
  { id: "hfc_410a", label: "R-410A" },
  { id: "hfc_404a", label: "R-404A" },
  { id: "hfc_407c", label: "R-407C" },
  { id: "hfc_507a", label: "R-507A" },
  { id: "hfc_other", label: "Other" },
];

export const stationarySourcesGroup: Group = {
  id: "g_scope1_stationary",
  name: "Stationary Sources",
  description: "Emissions from fixed facilities or equipment, such as power plants or boilers.",
  groupKey: "environment.ghg.scope1.stationarySources",
  sections: [
    {
      id: "sec_stat_1",
      name: "Stationary Sources",
      description: "Emissions from fixed facilities or equipment, such as power plants or boilers.",
      questions: [
        {
          id: "q_stat_1_1",
          number: "1.1",
          text: "Fuel-Powered Generators / Engines",
          required: true,
          status: "active",
          responses: [
            { id: "r_stat_1_1_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_stat_1_1_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_stat_1_1_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
        {
          id: "q_stat_1_2",
          number: "1.2",
          text: "Gas-fired turbines at power plants.",
          required: true,
          status: "active",
          responses: [
            { id: "r_stat_1_2_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_stat_1_2_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_stat_1_2_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
      ],
    },
    {
      id: "sec_stat_2",
      name: "Industrial Processes",
      description:
        "Emissions from manufacturing activities such as boilers and furnaces, based on the type and amount of fuel used.",
      questions: [
        {
          id: "q_stat_2_1",
          number: "2.1",
          text: "Boilers & Furnaces",
          required: true,
          status: "active",
          responses: [
            { id: "r_stat_2_1_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_stat_2_1_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_stat_2_1_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
      ],
    },
    {
      id: "sec_stat_3",
      name: "Oil and Gas Operations",
      description:
        "Emissions from exploration, extraction, processing, and transport of oil and gas, covering all related activities across the value chain.",
      questions: [
        {
          id: "q_stat_3_1",
          number: "3.1",
          text: "Heaters and boilers (oil production facilities, terminals, gas processing plants)",
          required: true,
          status: "active",
          responses: [
            { id: "r_stat_3_1_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_stat_3_1_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_stat_3_1_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
      ],
    },
  ],
};

export const mobileSourcesGroup: Group = {
  id: "g_scope1_mobile",
  name: "Mobile Sources",
  description: "Emissions from moving equipment or vehicles, such as trucks, ships, or planes.",
  groupKey: "environment.ghg.scope1.mobileSources",
  sections: [
    {
      id: "sec_mob_1",
      name: "Road Transportation",
      description: "Emissions from moving equipment or vehicles, such as trucks.",
      questions: [
        {
          id: "q_mob_1_1",
          number: "1.1",
          text: "Fleet Vehicles for Product Distribution and Logistics",
          required: true,
          status: "active",
          responses: [
            { id: "r_mob_1_1_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_mob_1_1_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_mob_1_1_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
        {
          id: "q_mob_1_2",
          number: "1.2",
          text: "Company cars and buses used for employee transportation.",
          required: true,
          status: "active",
          responses: [
            { id: "r_mob_1_2_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_mob_1_2_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_mob_1_2_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
      ],
    },
    {
      id: "sec_mob_2",
      name: "Off-road Vehicles & Equipment",
      description:
        "Emissions from vehicles and machinery not used on public roads, such as construction, mining, or agricultural equipment.",
      questions: [
        {
          id: "q_mob_2_1",
          number: "2.1",
          text: "Forklifts and other machinery used in warehouses and factory floors.",
          required: true,
          status: "active",
          responses: [
            { id: "r_mob_2_1_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_mob_2_1_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_mob_2_1_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
        {
          id: "q_mob_2_2",
          number: "2.2",
          text: "Heavy-duty vehicles and equipment used in construction and mining Subsidiaries",
          required: true,
          status: "active",
          responses: [
            { id: "r_mob_2_2_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_mob_2_2_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_mob_2_2_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
        {
          id: "q_mob_2_3",
          number: "2.3",
          text: "Tractors and other machinery on large commercial farms.",
          required: true,
          status: "active",
          responses: [
            { id: "r_mob_2_3_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_mob_2_3_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_mob_2_3_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
      ],
    },
    {
      id: "sec_mob_3",
      name: "Marine and Aviation",
      description:
        "Emissions from ships, boats, aircraft, and related Subsidiaries for transport or industrial use.",
      questions: [
        {
          id: "q_mob_3_1",
          number: "3.1",
          text: "Helicopters used for transporting personnel and equipment to offshore oil platforms.",
          required: true,
          status: "active",
          responses: [
            { id: "r_mob_3_1_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_mob_3_1_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_mob_3_1_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
        {
          id: "q_mob_3_2",
          number: "3.2",
          text: "Company-owned boats and vessels for transport.",
          required: true,
          status: "active",
          responses: [
            { id: "r_mob_3_2_a", type: "dropdown", title: "Fuel Type", options: fuelTypeOptions },
            { id: "r_mob_3_2_b", type: "numericInput", title: "Volume of Fuel Consumed" },
            { id: "r_mob_3_2_c", type: "dropdown", title: "Unit", options: unitOptions },
          ],
        },
      ],
    },
  ],
};

export const processEmissionsGroup: Group = {
  id: "g_scope1_process",
  name: "Process Emissions",
  description: "Greenhouse gases released during industrial or chemical processes, not from fuel combustion.",
  groupKey: "environment.ghg.scope1.processEmissions",
  sections: [
    {
      id: "sec_proc_1",
      name: "Cement Manufacturing",
      questions: [
        {
          id: "q_proc_1_1",
          number: "1.1",
          text: "Cement Manufacturing",
          required: true,
          status: "active",
          responses: [
            {
              id: "r_proc_1_1_a",
              type: "numericInput",
              title: "Quantity/Mass of Cement Manufactured/Produced",
            },
          ],
        },
      ],
    },
    {
      id: "sec_proc_2",
      name: "Gas Flaring",
      questions: [
        {
          id: "q_proc_2_1",
          number: "2.1",
          text: "Gas flaring: Deliberate burning of associated gas (can be classified as a process emission).",
          required: true,
          status: "active",
          responses: [
            {
              id: "r_proc_2_1_a",
              type: "numericInput",
              title: "Volume of gas flared (in standard cubic meters).",
            },
            {
              id: "r_proc_2_1_b",
              type: "numericInput",
              title: "Carbon content/composition of the flared gas.",
            },
          ],
        },
      ],
    },
  ],
};

export const fugitiveEmissionsGroup: Group = {
  id: "g_scope1_fugitive",
  name: "Fugitive Emissions",
  description:
    "Unplanned releases of gases from equipment, pipelines, storage tanks, or processes, including methane leaks, gas venting, flaring inefficiencies, and refrigerant losses.",
  groupKey: "environment.ghg.scope1.fugitiveEmissions",
  sections: [
    {
      id: "sec_fug_1",
      name: "Venting Natural Gas",
      questions: [
        {
          id: "q_fug_1_1",
          number: "1.1",
          text: "Venting of Natural Gas from Wells and Processing Facilities",
          required: true,
          status: "active",
          responses: [{ id: "r_fug_1_1_a", type: "numericInput", title: "Volume of Gas Vented" }],
        },
      ],
    },
    {
      id: "sec_fug_2",
      name: "HFC Leaks",
      questions: [
        {
          id: "q_fug_2_1",
          number: "2.1",
          text: "Leaks of HFCs from Cooling and Air Conditioning Units",
          required: true,
          status: "active",
          responses: [
            {
              id: "r_fug_2_1_a",
              type: "checkboxes",
              title: "Type of Hydrofluorocarbons (HFCs) used.",
              options: hfcOptions,
            },
            {
              id: "r_fug_2_1_b",
              type: "numericInput",
              title: "Quantity/Total mass of refrigerant leak in kg",
            },
          ],
        },
      ],
    },
  ],
};

export const scope1Groups: Group[] = [
  stationarySourcesGroup,
  mobileSourcesGroup,
  processEmissionsGroup,
  fugitiveEmissionsGroup,
];
