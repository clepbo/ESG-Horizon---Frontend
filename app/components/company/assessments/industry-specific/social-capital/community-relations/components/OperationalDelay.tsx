import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import React from "react";

interface Props {
  onBack: () => void;
  onDisclosureTopics: () => void;
}
export default function OperationalDelay({ onBack, onDisclosureTopics }: Props) {
  const features = [
    { label: "Dashboard", href: "/dashboard-esg" },
    { label: "Assessments", href: "/assessments/hub" },
    { label: "Disclosure topics", onClick: onDisclosureTopics },
    { label: "Community Relations", onClick: onBack },
    { label: "Operations Delays" },
  ];
  return (
    <section className="min-h-screen bg-green-50 p-6">
      <CustomBreadcrumbDynamic features={features} />
    </section>
  );
}
