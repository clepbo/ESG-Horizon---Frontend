"use client"

import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts"


interface ScopeData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface FuelMixData {
  name: string
  [key: string]: string | number
}

interface GHGEmissionsInventoryProps {
  scopeData: ScopeData[]
  fuelMixData: FuelMixData[]
  fuelKeys: string[] // keys used for stacked bars e.g. ["Scope 1", "Scope 2", "Scope 3"]
  fuelColors: string[] // colors for each stacked bar
}

// ---------- Component ----------
export default function GHGEmissionsInventory({
  scopeData,
  fuelMixData,
  fuelKeys,
  fuelColors,
}: GHGEmissionsInventoryProps) {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pie Chart */}
      <div>
        <h2 className="text-lg font-semibold mb-2">
          Scope Contribution Breakdown
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Percentage contribution by emission scope – 2025
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={scopeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {scopeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Fuel Mix Breakdown</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Emissions by fuel type across all scopes – tCO₂e
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={fuelMixData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name"  />
            <YAxis />
            <Tooltip />
            <Legend />
            {fuelKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={fuelColors[index] || "#000"}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}



const scopeData = [
  { name: "Scope 1 (Direct)", value: 69.7, color: "#FF6B3D" },
  { name: "Scope 2 (Indirect Energy)", value: 24, color: "#3E9BFF" },
  { name: "Scope 3 (Value Chain)", value: 10, color: "#9B4DFF" },
]

const fuelMixData = [
  { name: "Diesel", "Scope 1": 2000, "Scope 2": 800, "Scope 3": 200 },
  { name: "Natural Gas", "Scope 1": 1000, "Scope 2": 600, "Scope 3": 300 },
  { name: "Coal", "Scope 1": 1800, "Scope 2": 1600, "Scope 3": 600 },
  { name: "Grid Electricity", "Scope 1": 200, "Scope 2": 1400, "Scope 3": 300 },
  { name: "Biomass", "Scope 1": 2000, "Scope 2": 2000, "Scope 3": 800 },
  { name: "Other Fuels", "Scope 1": 1000, "Scope 2": 600, "Scope 3": 300 },
]

const fuelKeys = ["Scope 1", "Scope 2", "Scope 3"]
const fuelColors = ["#FF6B3D", "#3E9BFF", "#9B4DFF"]

export function EmissionInventoryWrapper() {
  return (
    <div className="">
        <h2 className="text-2xl font-semibold mb-4">GHG Emission Inventory</h2>
      <GHGEmissionsInventory
        scopeData={scopeData}
        fuelMixData={fuelMixData}
        fuelKeys={fuelKeys}
        fuelColors={fuelColors}
      />
    </div>
  )
}