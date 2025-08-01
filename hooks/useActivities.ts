// /hooks/useActivities.ts
import { useEffect, useState } from "react";
import type { Activity } from "@/mockData/recentActivities";
import { mockActivities } from "@/mockData/recentActivities";

export function useActivities() {
  const [data, setData] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        setData(mockActivities); // replace with real API call later
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load activities");
        setIsLoading(false);
      }
    }, 500);
  }, []);

  return { data, isLoading, error };
}
