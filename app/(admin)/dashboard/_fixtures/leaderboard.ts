export interface LeaderboardRow {
  rank: number;
  organization: string;
  industry: string;
  score: number;
  trend: { direction: "up" | "down" | "flat"; delta: number | null };
}

export const leaderboard: LeaderboardRow[] = [
  { rank: 1, organization: "Org A", industry: "Energy", score: 98, trend: { direction: "up", delta: 2 } },
  { rank: 2, organization: "Org B", industry: "Energy", score: 87, trend: { direction: "up", delta: 2 } },
  { rank: 3, organization: "Org C", industry: "Mfg", score: 83, trend: { direction: "flat", delta: null } },
  { rank: 4, organization: "Org D", industry: "Agri", score: 79, trend: { direction: "down", delta: 1 } },
  { rank: 5, organization: "Org E", industry: "Retail", score: 72, trend: { direction: "flat", delta: null } },
];
