"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HelpCircle, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { PillarScore } from "./types";

interface PillarScoreCardProps {
  pillar: PillarScore;
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-700";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function scoreBg(score: number): string {
  if (score >= 70) return "bg-green-50";
  if (score >= 40) return "bg-amber-50";
  return "bg-red-50";
}

export default function PillarScoreCard({ pillar }: PillarScoreCardProps) {
  const [open, setOpen] = useState(false);
  const hasIndicators = pillar.indicators && pillar.indicators.length > 0;
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dropdownWidth = 288; // w-72 = 18rem = 288px
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
    <div
      className="rounded-2xl bg-white p-3 sm:p-5 shadow-sm relative"
      style={{ borderLeft: `4px solid ${pillar.color}` }}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div
          className="shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: pillar.iconBg, color: pillar.color }}
        >
          {pillar.icon}
        </div>

        <p className="text-xs sm:text-sm font-semibold text-gray-900 min-w-0 break-words">
          {pillar.name}
        </p>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {pillar.score}
        </span>
        <span className="text-sm sm:text-base text-gray-700">/{pillar.maxScore}</span>
      </div>

      {hasIndicators && (
        <>
          <button
            ref={btnRef}
            type="button"
            onClick={() => setOpen(!open)}
            className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={`Score breakdown for ${pillar.name}`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {open &&
            createPortal(
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-[65]" onClick={() => setOpen(false)} />
                {/* Dropdown */}
                <div
                  ref={dropdownRef}
                  className="fixed z-[70] w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{pillar.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Score breakdown by indicator</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="px-4 py-2 space-y-2">
                    {pillar.indicators!.map((ind) => (
                      <div key={ind.label} className="flex items-center justify-between gap-2 py-1">
                        <span className="text-xs text-gray-700 flex-1" title={ind.label}>
                          {ind.label}
                        </span>
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreBg(ind.score)} ${scoreColor(ind.score)}`}
                        >
                          {ind.score.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Pillar Score</span>
                    <span className={`text-sm font-bold ${scoreColor(pillar.score)}`}>
                      {pillar.score}/{pillar.maxScore}
                    </span>
                  </div>
                </div>
              </>,
              document.body
            )}
        </>
      )}
    </div>
  );
}
