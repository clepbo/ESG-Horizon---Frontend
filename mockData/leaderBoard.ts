export type LeaderboardEntry = {
  rank: number;
  organization: string;
  score: string;
  reports: number;
};

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, organization: "Org A", score: "98%", reports: 24 },
  { rank: 2, organization: "Org B", score: "87%", reports: 21 },
  { rank: 3, organization: "Org C", score: "83%", reports: 21 },
  { rank: 4, organization: "Your Company", score: "70%", reports: 11 },
  { rank: 5, organization: "Org G", score: "68%", reports: 5 },
];
