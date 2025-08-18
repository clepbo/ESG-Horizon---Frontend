const subscriptionData = {
  monthlyRevenue: {
    amount: 150000,
  },
  stats: [
    {
      label: "Active Subscriptions",
      value: 7,
      change: { direction: "down" as const, value: "7%" },
      icon: "/icons/leaf.svg",
      iconBg: "bg-green-200",
    },
    {
      label: "Pending Payments",
      value: 3,
      change: { direction: "up" as const, value: "7%" },
      icon: "/icons/people-group.svg",
      iconBg: "bg-yellow-100",
    },
    {
      label: "Growth Rate",
      value: "+12%",
      change: { direction: "down" as const, value: "7%" },
      icon: "/icons/injustice.svg",
      iconBg: "bg-blue-100",
    },
  ],
};

export default subscriptionData;
