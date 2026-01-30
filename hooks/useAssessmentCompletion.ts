import { useState, useEffect } from "react";
import {
  checkScopeCompletion,
  checkTopicCompletion,
  type CompletionStatus,
} from "@/lib/assessmentCompletionUtils";

interface ScopeCard {
  title: string;
  [key: string]: any;
}

interface ScopeData {
  cards: ScopeCard[];
  [key: string]: any;
}

type CheckCompletionFn = (title: string, data: any) => CompletionStatus;

/**
 * Custom hook to manage assessment completion status for scope items
 * @param scopeData - Array of scope data containing cards with titles
 * @param assessmentData - Current assessment data from state
 * @param checkFn - Optional custom completion check function (defaults to checkScopeCompletion)
 * @returns Object containing completion status map and helper functions
 */
export function useAssessmentCompletion(
  scopeData: ScopeData[],
  assessmentData: any,
  checkFn: CheckCompletionFn = checkScopeCompletion
) {
  const [scopeCompletionStatus, setScopeCompletionStatus] = useState<
    Record<string, CompletionStatus>
  >({});

  // Calculate completion status for all scope items whenever assessment data changes
  useEffect(() => {
    const allScopeItems = scopeData.flatMap((scope) => scope.cards.map((card) => card.title));

    const statusMap: Record<string, CompletionStatus> = {};
    allScopeItems.forEach((scopeTitle) => {
      statusMap[scopeTitle] = checkFn(scopeTitle, assessmentData);
    });

    setScopeCompletionStatus(statusMap);
  }, [assessmentData, scopeData, checkFn]);

  /**
   * Get the completion status for a specific card
   */
  const getStatus = (cardTitle: string): CompletionStatus | undefined => {
    return scopeCompletionStatus[cardTitle];
  };

  /**
   * Get border class based on completion status
   * Updated to match the Activity Metrics card styling
   */
  const getCardBorderClass = (cardTitle: string): string => {
    const status = scopeCompletionStatus[cardTitle];
    if (!status) return "border-l-4 border-l-gray-300";

    switch (status.status) {
      case "completed":
        return "border-l-4 border-l-green-500";
      case "in-progress":
        return "border-l-4 border-l-yellow-500";
      case "not-started":
      default:
        return "border-l-4 border-l-gray-300";
    }
  };

  return {
    scopeCompletionStatus,
    getStatus,
    getCardBorderClass,
  };
}

/**
 * Specialized hook for topic-level completion checking
 * @param topicData - Array of topic data containing cards with titles
 * @param assessmentData - Current assessment data from state
 * @returns Object containing completion status map and helper functions
 */
export function useTopicCompletion(topicData: ScopeData[], assessmentData: any) {
  return useAssessmentCompletion(topicData, assessmentData, checkTopicCompletion);
}
