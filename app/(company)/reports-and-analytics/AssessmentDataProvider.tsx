"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { AssessmentData } from "@/hooks/useAssessment";

interface AssessmentDataContextType {
  assessmentData: AssessmentData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

const AssessmentDataContext = createContext<AssessmentDataContextType | undefined>(undefined);

export function AssessmentDataProvider({ children }: { children: ReactNode }) {
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssessmentData = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const savedData = localStorage.getItem("esg-assessment-data");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setAssessmentData(parsedData);
      }
    } catch (err) {
      setError("Failed to load assessment data");
      console.error("Error loading assessment data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadAssessmentData();
  };

  useEffect(() => {
    loadAssessmentData();
  }, []);

  return (
    <AssessmentDataContext.Provider value={{
      assessmentData,
      isLoading,
      error,
      refreshData
    }}>
      {children}
    </AssessmentDataContext.Provider>
  );
}

export function useAssessmentData() {
  const context = useContext(AssessmentDataContext);
  if (context === undefined) {
    throw new Error("useAssessmentData must be used within an AssessmentDataProvider");
  }
  return context;
}
