import React from "react";

import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import NotAvailablePlaceholder from "../components/NotAvailablePlaceholder";
import { formatNumberWithCommas } from "../../utils/helpers";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";

interface Props {
  borderColor: string;
  title: string;
  sub: string;
  amount: number;
}

export default function OilRenderCard({ borderColor, title, sub, amount }: Props) {
  return (
    <div
      className={`shadow rounded-md max-w-md border-l-2 p-4 flex flex-col hover:shadow-lg transition-shadow duration-300 bg-white`}
      style={{
        borderColor: borderColor,
      }}
    >
      <p className="text-gray-800">{title}</p>
      {typeof amount === "number" && amount >= 0 && (
        <p className="font-bold text-3xl">
          {formatNumberFigures(amount)} <sub className="text-gray-400 text-xs">{sub}</sub>
        </p>
      )}

      {typeof amount !== "number" || amount < 0 ? <NotAvailablePlaceholder /> : null}
    </div>
  );
}

interface WaterQualityCardProps {
  title: string;
  sub?: string;
  amount: number;
  progress: number;
}
export function WaterQualityCard({ title, sub = "", amount, progress }: WaterQualityCardProps) {
  return (
    <div className="flex items-center justify-between w-full shadow rounded-md max-w-md p-4 hover:shadow-lg transition-shadow duration-300 bg-white">
      <div className={``}>
        <p className="text-gray-800">{title}</p>
        <p className="font-bold text-3xl">
          {amount.toLocaleString()} <sub className="text-xs">{sub}</sub>
        </p>
      </div>

      <div className="w-12.5 h-12.5">
        <CircularProgressbarWithChildren
          value={progress}
          styles={buildStyles({ pathColor: progress > 50 ? "green" : "red" })}
        >
          <div style={{ fontSize: 12, marginTop: -5 }}>
            <strong>{progress}%</strong>
          </div>
        </CircularProgressbarWithChildren>
      </div>
    </div>
  );
}

export const cardData = [
  { title: "Crude Oil", amount: -10, sub: "kbbl/day", borderColor: "#F28B0D" },
  { title: "Synthetic Oil", amount: -20, sub: "kbbl/day", borderColor: "#FCDC8B" },
  { title: "Natural Gas", amount: -20, sub: "mmscfd", borderColor: "#3B82F6" },
  { title: "Synthetic Gas", amount: -30, sub: "mmscfd", borderColor: "#BFD7FE" },
];

export const data = [
  {
    name: "Oil Production",
    crudeOil: 500,
    syntheticOil: 50,
  },
  {
    name: "Gas Production",
    naturalGas: 300,
    syntheticGas: 60,
  },
];
