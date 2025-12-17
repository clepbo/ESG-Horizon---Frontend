"use client";

import { useEffect, useState } from "react";

// Type definitions
interface TabsProps {
  children: (props: {
    activeTab: string;
    setActiveTab: (value: string) => void;
  }) => React.ReactNode;
  defaultValue?: string;
  value: string;
  onValueChange: (value: string) => void;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  activeTab: string;
  onClick: (value: string) => void;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  activeTab: string;
  children: React.ReactNode;
}

// Tab Components
export const Tabs = ({ children, defaultValue = "", value, onValueChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(value || defaultValue);

  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return <div className="w-full">{children({ activeTab, setActiveTab: handleTabChange })}</div>;
};

export const TabsList = ({ children }: TabsListProps) => (
  <div className="grid grid-cols-2 gap-2 mb-6">{children}</div>
);

export const TabsTrigger = ({ value, activeTab, onClick, children }: TabsTriggerProps) => (
  <button
    onClick={() => onClick(value)}
    className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
      activeTab === value
        ? "bg-primary text-white"
        : "bg-white text-gray-600 border border-gray-300"
    } hover:bg-primary/90 hover:text-white`}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, activeTab, children }: TabsContentProps) => {
  if (value !== activeTab) return null;
  return <div>{children}</div>;
};
