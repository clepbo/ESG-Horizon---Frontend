export type PendingTone = "danger" | "warning" | "info";

export interface PendingAction {
  id: string;
  title: string;
  subtitle: string;
  tone: PendingTone;
}

export const pendingActions: PendingAction[] = [
  {
    id: "1",
    title: "3 Failed payment attempts",
    subtitle: "Requires billing review",
    tone: "danger",
  },
  {
    id: "2",
    title: "5 Companies awaiting approval",
    subtitle: "Pending onboarding review",
    tone: "warning",
  },
  {
    id: "3",
    title: "Algorithm draft v2.5.0 unpublished",
    subtitle: "Awaiting admin publish",
    tone: "info",
  },
];
