import type { LucideIcon } from "lucide-react";
import type { SectionStatus } from "@/lib/assessmentStatusUtils";

/* ─── File / Document types ─── */

export interface FileWithMeta {
  name: string;
  url?: string;
  publicId?: string;
  section: string;
  size?: number;
  uploadedAt?: string;
}

export interface FileMetadata {
  name: string;
  size?: number;
  lastModified?: number;
  url?: string;
  publicId?: string;
}

/* ─── Data display types ─── */

export interface DataFieldItem {
  label: string;
  value: any;
  unit?: string;
  highlight?: boolean;
  isBoolean?: boolean;
}

/* ─── Pillar tab types ─── */

export type PillarTabId =
  | "activity-metrics"
  | "environmental"
  | "social-capital"
  | "human-capital"
  | "business-model"
  | "leadership";

export interface PillarTabConfig {
  id: PillarTabId;
  label: string;
  icon: LucideIcon;
}

/* ─── Metric accordion types ─── */

export interface MetricAccordionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  status?: SectionStatus;
  badge?: string;
  children: React.ReactNode;
}

/* ─── Sub-metric section types ─── */

export interface SubMetricSectionProps {
  title: string;
  status?: SectionStatus;
  onEdit?: () => void;
  onClear?: () => void;
  documents?: FileWithMeta[];
  children: React.ReactNode;
}

/* ─── Modal props ─── */

export interface AssessmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  assessment: {
    id: number;
    status?: string;
    [key: string]: any;
  } | null;
}
