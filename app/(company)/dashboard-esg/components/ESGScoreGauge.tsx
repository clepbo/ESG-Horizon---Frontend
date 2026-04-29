"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { PieChart, Pie, Cell } from "recharts";
import { HelpCircle, X, Award } from "lucide-react";

interface ESGScoreGaugeProps {
  score: number;
  maxScore?: number;
  grade?: string | null;
}

interface GradeInfo {
  bg: string;
  text: string;
  border: string;
  fill: string;
  label: string;
  description: string;
  range: string;
}

const GRADE_MAP: Record<string, GradeInfo> = {
  "A+": {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    fill: "#059669",
    label: "Industry Leader",
    description:
      "Exceptional ESG performance. Industry-leading practices across all pillars with minimal risk exposure.",
    range: "95 – 100",
  },
  A: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    fill: "#10B981",
    label: "Excellent",
    description:
      "Excellent ESG performance with robust management systems and low material risk across all pillars.",
    range: "85 – 94",
  },
  "B+": {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    fill: "#14B8A6",
    label: "Strong",
    description:
      "Strong ESG performance. Key risks are well managed with clear improvement trajectories.",
    range: "75 – 84",
  },
  B: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    fill: "#3B82F6",
    label: "Average / Compliant",
    description:
      "Average ESG performance. Meets baseline compliance requirements; some material risks need further attention.",
    range: "65 – 74",
  },
  C: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    fill: "#F59E0B",
    label: "Weak / At Risk",
    description:
      "Weak ESG performance. Significant gaps in risk management that could impact operations and stakeholders.",
    range: "50 – 64",
  },
  D: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    fill: "#EF4444",
    label: "Critical Failure",
    description:
      "Critical ESG deficiencies. Immediate action needed across multiple pillars to address material risks.",
    range: "0 – 49",
  },
};

const GRADE_ORDER = ["A+", "A", "B+", "B", "C", "D"];

export default function ESGScoreGauge({ score, maxScore = 100, grade }: ESGScoreGaugeProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const percentage = Math.min((score / maxScore) * 100, 100);
  const data = [
    { name: "Score", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  const gradeInfo = grade && grade !== "N/A" ? (GRADE_MAP[grade] ?? null) : null;
  const gaugeColor = gradeInfo?.fill ?? "#119B95";

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dropdownWidth = 320;
    let left = rect.right - dropdownWidth;
    if (left < 8) left = 8;
    setPos({ top: rect.bottom + 4, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  return (
    <div className="rounded-2xl bg-white p-6 flex flex-col items-center justify-center h-full min-h-[180px] shadow-sm cursor-default relative">
      {/* Header */}
      <div className="flex items-center gap-2 self-start w-full">
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-900 break-words">
          Overall ESG Score
        </p>
        <div className="ml-auto flex items-center gap-2">
          {gradeInfo && grade && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold border ${gradeInfo.bg} ${gradeInfo.text} ${gradeInfo.border}`}
            >
              <Award className="w-7 h-7" />
              {grade}
            </span>
          )}
          <button
            ref={btnRef}
            type="button"
            onClick={() => setOpen(!open)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="ESG grade breakdown"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gauge */}
      <div className="relative mt-2">
        <PieChart width={180} height={110}>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={65}
            outerRadius={85}
            dataKey="value"
            stroke="none"
            cornerRadius={4}
          >
            <Cell fill={gaugeColor} />
            <Cell fill="#E5E7EB" />
          </Pie>
        </PieChart>

        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
          <span className="text-3xl font-bold text-gray-900">{score}</span>
          <span className="text-base text-gray-700">/{maxScore}</span>
        </div>
      </div>

      {/* Grade label under gauge */}
      {gradeInfo && (
        <p className={`mt-1 text-xs font-semibold ${gradeInfo.text}`}>{gradeInfo.label}</p>
      )}

      {/* Popover via portal */}
      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[65]" onClick={() => setOpen(false)} />
            <div
              className="fixed z-[70] w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              style={{ top: pos.top, left: pos.left }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">ESG Grade Scale</p>
                  <p className="text-xs text-gray-500 mt-0.5">Based on weighted pillar scores</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Current grade description */}
              {gradeInfo && grade && (
                <div
                  className={`mx-4 mt-3 p-3 rounded-lg border ${gradeInfo.bg} ${gradeInfo.border}`}
                >
                  <div className="flex items-center gap-2">
                    <Award className={`w-4 h-4 ${gradeInfo.text}`} />
                    <span className={`text-sm font-bold ${gradeInfo.text}`}>
                      Your grade: {grade} — {gradeInfo.label}
                    </span>
                  </div>
                  <p className={`text-xs mt-1.5 ${gradeInfo.text} opacity-80`}>
                    {gradeInfo.description}
                  </p>
                </div>
              )}

              {/* Grade scale */}
              <div className="px-4 py-3 space-y-1.5">
                {GRADE_ORDER.map((g) => {
                  const info = GRADE_MAP[g];
                  const isActive = g === grade;
                  return (
                    <div
                      key={g}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors ${isActive ? `${info.bg} ${info.border} border` : ""}`}
                    >
                      <span
                        className="w-8 text-center text-xs font-bold py-0.5 rounded"
                        style={{ backgroundColor: info.fill, color: "#fff" }}
                      >
                        {g}
                      </span>
                      <span className="text-xs text-gray-700 flex-1">{info.label}</span>
                      <span className="text-[10px] text-gray-500">{info.range}</span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-500">
                  Weights: Environmental 41% · Social 26% · Governance 33%
                </p>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
