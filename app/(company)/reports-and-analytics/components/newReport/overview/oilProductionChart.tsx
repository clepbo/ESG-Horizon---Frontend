"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { data } from "./OilRenderCard";
import NotAvailablePlaceholder from "../components/NotAvailablePlaceholder";

export default function ProductionVolumesChart() {
  let item = false;
  return (
    <div className="w-full h-full bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Production Volumes</h3>
      {item && (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="bottom" />

            <Bar dataKey="crudeOil" name="Crude Oil" fill="#f7931a" radius={[6, 6, 0, 0]} />
            <Bar dataKey="syntheticOil" name="Synthetic Oil" fill="#fcd88b" radius={[6, 6, 0, 0]} />
            <Bar dataKey="naturalGas" name="Natural Gas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="syntheticGas" name="Synthetic Gas" fill="#bfdbfe" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      {!item && <NotAvailablePlaceholder />}
    </div>
  );
}
