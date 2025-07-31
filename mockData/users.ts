export const mockUsers = [
  {
    id: "1",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "Admin",
    status: "Active",
    recentActivities: [
      { id: 1, action: "Logged in", timestamp: "2025-07-30T08:00:00Z" },
      { id: 2, action: "Updated profile", timestamp: "2025-07-30T09:00:00Z" },
    ],
  },
  {
    id: "2",
    name: "John Smith",
    email: "john@example.com",
    role: "User",
    status: "Suspended",
    recentActivities: [
      { id: 1, action: "Submitted report", timestamp: "2025-07-29T10:00:00Z" },
    ],
  },
];
