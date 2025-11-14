import { Button } from "@/app/components/ui/button";

interface TableRowStatus {
  status: "Working on it" | "Awaiting Review" | "In Progress" | string;
}

interface StatusBadgeProps {
  status: TableRowStatus["status"];
}

export function BadgeStatus({ status }: StatusBadgeProps) {
  const getVariant = (status: TableRowStatus["status"]) => {
    switch (status) {
      case "Working on it":
        return "status-working";
      case "Awaiting Review":
        return "status-awaiting";
      case "In Progress":
        return "status-progress";
      default:
        return "secondary";
    }
  };

  return (
    <Button
      variant={getVariant(status) as any}
      size="sm"
      className="rounded-full px-3 py-1 text-xs font-medium"
    >
      {status}
    </Button>
  );
}
