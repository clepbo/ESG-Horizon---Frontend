export interface NotificationPref {
  key: string;
  title: string;
  subtitle: string;
  enabled: boolean;
}

export const notificationsFixture: NotificationPref[] = [
  {
    key: "new_company",
    title: "New company registration",
    subtitle: "Alert when a company registers",
    enabled: true,
  },
  {
    key: "payment_failures",
    title: "Payment failures",
    subtitle: "Alert on billing issues",
    enabled: true,
  },
  {
    key: "report_submissions",
    title: "Report submissions",
    subtitle: "New ESG reports for review",
    enabled: true,
  },
  {
    key: "algorithm_draft",
    title: "Algorithm draft saved",
    subtitle: "When config changes are drafted",
    enabled: false,
  },
  {
    key: "weekly_digest",
    title: "Weekly summary digest",
    subtitle: "Platform health summary every Monday",
    enabled: true,
  },
];
