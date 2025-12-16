import React from "react";

interface Props {
  borderColor: string;
  title: string;
  sub: string;
  amount: number;
}
export default function OilRenderCard({ borderColor, title, sub, amount }: Props) {
  return (
    <div
      className={`shadow rounded-md border-l-2 p-4 flex flex-col `}
      style={{
        borderColor: borderColor,
      }}
    >
      <p className="text-gray-800">{title} </p>
      <p className="font-bold text-3xl">
        {amount} <sub className="text-gray-400 text-xs"> {sub} </sub>{" "}
      </p>
    </div>
  );
}

export const cardData = [
  { title: "Crude Oil", amount: 500, sub: "kbbl/day", borderColor: "#F28B0D" },
  { title: "Synthetic Oil", amount: 38, sub: "kbbl/day", borderColor: "#FCDC8B" },
  { title: "Natural Gas", amount: 300, sub: "mmscfd", borderColor: "#3B82F6" },
  { title: "Synthetic Gas", amount: 30, sub: "mmscfd", borderColor: "#BFD7FE" },
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
