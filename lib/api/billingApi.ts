import { mockBillingData, BillingRecord } from "@/lib/mockData/billingData";

export async function fetchBillingData(): Promise<BillingRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockBillingData), 500); // Simulated API delay
  });
}
