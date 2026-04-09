import React from "react";
import { FaLeaf } from "react-icons/fa";
import { PiUsersFill } from "react-icons/pi";
import { TbBriefcaseFilled } from "react-icons/tb";
import { HardHat } from "lucide-react";
import { VscLaw } from "react-icons/vsc";
import type {
  PillarScore,
  EmissionTrendPoint,
} from "./types";

// TODO: Wire to real endpoint when 5-pillar scoring backend is ready
export const MOCK_PILLAR_SCORES: PillarScore[] = [
  {
    id: "environmental",
    name: "Environmental",
    score: 78,
    maxScore: 100,
    color: "#1e8a3d",
    iconBg: "#f1fcf4",
    icon: React.createElement(FaLeaf, { className: "w-6 h-6" }),
  },
  {
    id: "social-capital",
    name: "Social Capital",
    score: 64,
    maxScore: 100,
    color: "#2570eb",
    iconBg: "#eff5ff",
    icon: React.createElement(PiUsersFill, { className: "w-6 h-6" }),
  },
  {
    id: "human-capital",
    name: "Human Capital",
    score: 71,
    maxScore: 100,
    color: "#F59E0B",
    iconBg: "#FEF9C3",
    icon: React.createElement(HardHat, { className: "w-6 h-6" }),
  },
  {
    id: "business-model",
    name: "Business Model",
    score: 58,
    maxScore: 100,
    color: "#af57db",
    iconBg: "#f5e2ff",
    icon: React.createElement(TbBriefcaseFilled, { className: "w-6 h-6" }),
  },
  {
    id: "leadership-governance",
    name: "Leadership & Governance",
    score: 82,
    maxScore: 100,
    color: "#4a4a4a",
    iconBg: "#e8e8e8",
    icon: React.createElement(VscLaw, { className: "w-6 h-6" }),
  },
];

// TODO: Wire to real historical emissions endpoint
export const MOCK_EMISSION_TREND: EmissionTrendPoint[] = [
  { year: 2022, scope1: 40000, scope2: 8000, scope3: 152000, total: 200000 },
  { year: 2023, scope1: 38000, scope2: 7500, scope3: 148000, total: 193500 },
  { year: 2024, scope1: 35000, scope2: 7200, scope3: 140000, total: 182200 },
  { year: 2025, scope1: 32000, scope2: 7000, scope3: 130000, total: 169000 },
  { year: 2026, scope1: 30000, scope2: 6500, scope3: 125000, total: 161500 },
];

// TODO: Wire to real scope breakdown from report endpoint
export const MOCK_TOTAL_EMISSION = {
  total: 461131,
  scope1: 32000,
  scope2: 7000,
  scope3: 422131,
};
