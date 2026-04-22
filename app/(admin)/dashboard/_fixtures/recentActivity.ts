export interface ActivityEntry {
  id: string;
  title: string;
  actor: string;
  context: string;
  time: string;
  initials: string;
  initialsColor: string;
}

export const recentActivity: ActivityEntry[] = [
  {
    id: "1",
    title: "Published algorithm v2.4.1",
    actor: "Israel Oni",
    context: "Algorithm Config",
    time: "2h ago",
    initials: "OA",
    initialsColor: "#0d9488",
  },
  {
    id: "2",
    title: "Approved GreenFlow Inc.",
    actor: "Kristin Watson",
    context: "Company",
    time: "4h ago",
    initials: "OA",
    initialsColor: "#3b82f6",
  },
  {
    id: "3",
    title: "Added Q2 2025 assessment questions",
    actor: "Albert Flores",
    context: "Assessments",
    time: "Yesterday",
    initials: "OA",
    initialsColor: "#ec4899",
  },
  {
    id: "4",
    title: "Submitted Q2 Environmental Report",
    actor: "Jenny Wilson",
    context: "Reports",
    time: "Yesterday",
    initials: "OA",
    initialsColor: "#f59e0b",
  },
];
