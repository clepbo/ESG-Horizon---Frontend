"use client";

import React from "react";

interface TabBarProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabBar({ tabs, activeTab, setActiveTab }: TabBarProps) {
  return (
    <div className="flex gap-3 border border-gray-200 rounded-lg p-2 bg-white mx-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 px-6 py-2 rounded border transition-colors cursor-pointer ${
            activeTab === tab
              ? "bg-[var(--color-primary)]   text-white border-teal-500"
              : "bg-white text-teal-600 border-teal-500 hover:bg-green-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
