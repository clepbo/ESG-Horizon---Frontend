import { Badge } from "@/app/components/ui/badge";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/app/components/ui/accordion";
import type { SectionStatus } from "@/lib/assessmentStatusUtils";
import type { LucideIcon } from "lucide-react";

interface MetricAccordionProps {
  value: string;
  icon: LucideIcon;
  title: string;
  /** Subtitle line — e.g. "4 form · IFRS: EM-EP-140a.1 – 140a.4" */
  description?: string;
  status?: SectionStatus;
  /** Summary value badge — e.g. "461,131.16 tCO₂e", "12,500 m³ withdrawn" */
  badge?: string;
  /** Number of incomplete sub-sections (shown as "X incomplete" teal badge) */
  incompleteCount?: number;
  children: React.ReactNode;
}

const statusBadge: Record<SectionStatus, { label: string; className: string }> = {
  submitted: { label: "Complete", className: "bg-green-500 text-white border-transparent" },
  "in-progress": { label: "In Progress", className: "bg-yellow-400 text-black border-transparent" },
  "not-started": { label: "Not Started", className: "bg-gray-400 text-white border-transparent" },
};

export function MetricAccordion({
  value,
  icon: Icon,
  title,
  description,
  status,
  badge,
  incompleteCount,
  children,
}: MetricAccordionProps) {
  return (
    <AccordionItem value={value} className="border rounded-xl px-5 bg-white shadow-sm">
      <AccordionTrigger className="hover:no-underline py-5">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-gray-100 rounded-lg shrink-0">
            <Icon className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-base font-bold text-gray-900">{title}</span>
            {description && (
              <p className="text-xs text-gray-700 font-normal mt-0.5">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto mr-2 shrink-0">
            {badge && (
              <Badge variant="outline" className="text-xs font-medium">
                {badge}
              </Badge>
            )}
            {incompleteCount != null && incompleteCount > 0 && (
              <Badge variant="outline" className="text-xs font-medium border-teal-300 text-teal-700 bg-teal-50">
                {incompleteCount} incomplete
              </Badge>
            )}
            {status && (
              <Badge variant="outline" className={`text-xs font-medium ${statusBadge[status].className}`}>
                {statusBadge[status].label}
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-6 space-y-6">{children}</AccordionContent>
    </AccordionItem>
  );
}
