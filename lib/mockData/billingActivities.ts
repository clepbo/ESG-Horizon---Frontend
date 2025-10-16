export type ActivityType = "success" | "failed" | "upgrade" | "expired" | "cancelled";

export interface Activity {
  id: number;
  title: string;
  description: string;
  datetime: string;
  type: ActivityType;
}

export const activities: Activity[] = [
  {
    id: 1,
    title: "New Subscription Activated",
    description: "GreenTech Solutions subscribed to the Premium Plan.",
    datetime: "2025-07-17 11:45 AM",
    type: "success",
  },
  {
    id: 2,
    title: "Payment Failed",
    description: "EduVault’s monthly payment attempt failed due to insufficient funds.",
    datetime: "2025-07-19 10:12 AM",
    type: "failed",
  },
  {
    id: 3,
    title: "Subscription Upgraded",
    description: "NewGen Technologies upgraded from Basic to Standard Plan.",
    datetime: "2025-07-18 03:30 PM",
    type: "upgrade",
  },
  {
    id: 4,
    title: "Trial Expired",
    description: "UrbanRenewal Group’s free trial expired.",
    datetime: "2025-07-20 09:00 AM",
    type: "expired",
  },
  {
    id: 5,
    title: "Subscription Cancelled",
    description: "SafeGrid Alliance cancelled their Standard subscription plan.",
    datetime: "2025-07-19 01:45 PM",
    type: "cancelled",
  },
];
