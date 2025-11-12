import { useQuery } from "@tanstack/react-query";
import { mockLeaderboard } from "@/lib/mockData/leaderBoard";

import type { LeaderboardEntry } from "@/lib/mockData/leaderBoard";

export async function fetchMockLeaderboard(): Promise<LeaderboardEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockLeaderboard), 300);
  });
}

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: fetchMockLeaderboard,
    staleTime: 1000 * 60 * 5,
  });
}
