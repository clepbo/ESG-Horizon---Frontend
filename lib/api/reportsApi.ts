import { mockReports, Report } from "@/mockData/mockReports";

const USE_MOCK = true;

export async function fetchReports(): Promise<Report[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockReports), 300);
    });
  }

  const res = await fetch("/api/reports");
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}
