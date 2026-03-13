import {
  BarChart3,
  Leaf,
  Users,
  HardHat,
  Lightbulb,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { PillarTabConfig, PillarTabId } from "./types";

/* ─── Pillar tab configuration ─── */

export const PILLAR_TABS: PillarTabConfig[] = [
  { id: "activity-metrics", label: "Activity Metric", icon: BarChart3 },
  { id: "environmental", label: "Environmental", icon: Leaf },
  { id: "social-capital", label: "Social Capital", icon: Users },
  { id: "human-capital", label: "Human Capital", icon: HardHat },
  { id: "business-model", label: "Business Model", icon: Lightbulb },
  { id: "leadership", label: "Leadership", icon: Shield },
];

/* ─── Status badge configuration ─── */

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  in_progress: {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  awaiting_review: {
    label: "Awaiting Review",
    color: "bg-blue-100 text-blue-800",
    icon: AlertCircle,
  },
  submitted_approved: {
    label: "Submitted-Approved",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  declined: {
    label: "Declined",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

/* ─── Default tab ─── */

export const DEFAULT_TAB: PillarTabId = "activity-metrics";
