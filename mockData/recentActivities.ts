// /mockData/recentActivities.ts
export type ActivityType =
  | "published"
  | "failed"
  | "upgrade"
  | "expired"
  | "cancelled";

export interface Activity {
  id: number;
  title: string;
  description: string;
  datetime: string;
  type: ActivityType;
}

export const mockActivities: Activity[] = [
  {
    id: 1,
    title: "New Subscription Activated",
    description: "GreenTech Solutions subscribed to the Premium Plan.",
    datetime: "2024-07-31 10:45 AM",
    type: "published",
  },
  {
    id: 2,
    title: "Payment Failed",
    description:
      "Acme Tech's monthly payment attempt failed due to insufficient funds.",
    datetime: "2024-07-31 10:42 AM",
    type: "failed",
  },
  {
    id: 3,
    title: "Subscription Upgraded",
    description: "NeoClean Technologies upgraded from Basic to Standard Plan.",
    datetime: "2024-07-30 04:20 PM",
    type: "upgrade",
  },
  {
    id: 4,
    title: "Trial Expired",
    description: "Sustainable Group trial has expired.",
    datetime: "2024-07-30 04:20 PM",
    type: "expired",
  },
  {
    id: 5,
    title: "Subscription Cancelled",
    description: "Renewed Dennis cancelled their Standard subscription plan.",
    datetime: "2024-07-29 03:45 PM",
    type: "cancelled",
  },
];
