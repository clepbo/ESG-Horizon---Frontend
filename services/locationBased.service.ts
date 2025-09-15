// import api from "@/lib/api/axios";

// // Define the types for the request body
// export interface CreateLocationBasedPayload {
//   id?: number;
//   name?: string;
//   subscriptionId: number;
//   creator_id?: number;
//   total_electricity_consumption?: number;
//   reporting_period_consumption?: "MONTHLY"; // Assuming a fixed value
//   electricity_supplier?: string;
//   invoice_from_electricity_distribution_companies_url?: File;
//   invoice_from_electricity_distribution_companies_url_public_id?: string;
//   smart_or_sub_meter_reading_url?: File;
//   smart_or_sub_meter_reading_url_public_id?: string;
//   utility_contract_or_purchase_agreement_url?: File;
//   utility_contract_or_purchase_agreement_url_public_id?: string;
//   amount_of_cooling_energy_consumed?: number;
//   purchased_cooling_type_of_cooling_system_used?: string;
//   purchased_cooling_reporting_period?: "MONTHLY"; // Assuming a fixed value
//   cooling_energy_invoices_from_service_providers_url?: File;
//   cooling_energy_invoices_from_service_providers_url_public_id?: string;
//   equipment_performance_log_url?: File;
//   equipment_performance_log_url_public_id?: string;
//   sub_metering_records_url?: File;
//   sub_metering_records_url_public_id?: string;
//   total_steam_consumed?: number;
//   source_of_steam_consumed?: string;
//   purchased_steam_reporting_period?: "MONTHLY"; // Assuming a fixed value
//   supplier_invoice_for_steam_purchased_url?: File;
//   supplier_invoice_for_steam_purchased_url_public_id?: string;
//   metered_record_for_steam_consumed_url?: File;
//   metered_record_for_steam_consumed_url_public_id?: string;
//   contracts_with_third_party_providers_url?: File;
//   contracts_with_third_party_providers_url_public_id?: string;
//   was_heating_energy_purchased?: boolean;
//   total_energyGJ?: number;
//   supplier?: string;
//   invoices_for_heating_services_url?: File;
//   invoices_for_heating_services_url_public_id?: string;
//   metered_heating_records_url?: File;
//   metered_heating_records_url_public_id?: string;
//   supplier_contracts_url?: File;
//   supplier_contracts_url_public_id?: string;
//   certification_of_refigirant_type_url?: File;
//   certification_of_refigirant_type_url_public_id?: string;
//   additional_documents?: {
//     name: string;
//     url: string;
//     publicId: string;
//   }[];
// }

// export const locationBasedService = {
//   createLocationBased: async (payload: CreateLocationBasedPayload) => {
//     const formData = new FormData();
//     // Append each field to the FormData object
//     Object.keys(payload).forEach((key) => {
//       const value = payload[key as keyof CreateLocationBasedPayload];
//       if (value !== undefined) {
//         formData.append(key, value as string | Blob);
//       }
//     });

//     try {
//       const { data } = await api.post("/location-based-s2", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       return data;
//     } catch (error) {
//       console.error("Error creating LocationBasedS2 record:", error);
//       throw error;
//     }
//   },
// };
import api from "@/lib/api/axios";

// Define the types for the request body
export interface CreateLocationBasedPayload {
  id?: number;
  name?: string;
  subscriptionId: number;
  creator_id?: number;
  total_electricity_consumption?: number;
  reporting_period_consumption?: "MONTHLY" | "QUARTERLY" | "YEARLY";
  electricity_supplier?: string;
  invoice_from_electricity_distribution_companies_url?: string;
  invoice_from_electricity_distribution_companies_url_public_id?: string;
  smart_or_sub_meter_reading_url?: string;
  smart_or_sub_meter_reading_url_public_id?: string;
  utility_contract_or_purchase_agreement_url?: string;
  utility_contract_or_purchase_agreement_url_public_id?: string;
  amount_of_cooling_energy_consumed?: number;
  purchased_cooling_type_of_cooling_system_used?: string;
  purchased_cooling_reporting_period?: "MONTHLY" | "QUARTERLY" | "YEARLY";
  cooling_energy_invoices_from_service_providers_url?: string;
  cooling_energy_invoices_from_service_providers_url_public_id?: string;
  equipment_performance_log_url?: string;
  equipment_performance_log_url_public_id?: string;
  sub_metering_records_url?: string;
  sub_metering_records_url_public_id?: string;
  total_steam_consumed?: number;
  source_of_steam_consumed?: string;
  purchased_steam_reporting_period?: "MONTHLY" | "QUARTERLY" | "YEARLY";
  supplier_invoice_for_steam_purchased_url?: string;
  supplier_invoice_for_steam_purchased_url_public_id?: string;
  metered_record_for_steam_consumed_url?: string;
  metered_record_for_steam_consumed_url_public_id?: string;
  contracts_with_third_party_providers_url?: string;
  contracts_with_third_party_providers_url_public_id?: string;
  was_heating_energy_purchased?: boolean;
  total_energyGJ?: number;
  supplier?: string;
  invoices_for_heating_services_url?: string;
  invoices_for_heating_services_url_public_id?: string;
  metered_heating_records_url?: string;
  metered_heating_records_url_public_id?: string;
  supplier_contracts_url?: string;
  supplier_contracts_url_public_id?: string;
  certification_of_refigirant_type_url?: string;
  certification_of_refigirant_type_url_public_id?: string;
  additional_documents?: {
    name: string;
    url: string | null;
    publicId: string | null;

    size: number;
    lastModified: number;
  }[];
}

export const locationBasedService = {
  createLocationBased: async (payload: CreateLocationBasedPayload) => {
    const formData = new FormData();

    // Iterate over the payload and append each field
    // Correctly handle non-string values like numbers, booleans, and arrays
    Object.keys(payload).forEach((key) => {
      const value = payload[key as keyof CreateLocationBasedPayload];
      if (value !== undefined && value !== null) {
        // If the value is an array (like additional_documents), stringify it
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          // Append booleans as 'true' or 'false' strings
          formData.append(key, value.toString());
        } else {
          // For all other types (numbers, strings), append them directly
          formData.append(key, value as string | Blob);
        }
      }
    });

    try {
      const { data } = await api.post("/location-based-s2", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (error) {
      console.error("Error creating LocationBasedS2 record:", error);
      throw error;
    }
  },
};
