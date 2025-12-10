"use client";

import { useState } from "react";
import { MyTasksList } from "./MyTasksList";
import { DisclosureTopics } from "./DisclosureTopics";
import { FrontendTask } from "@/services/assignTask.service";
import { useAssessment } from "@/hooks/useAssessment";
import api from "@/lib/api/axios";

interface UserTasksCoordinatorProps {
  onBack: () => void;
}

type ViewState =
  | { type: "task-list" }
  | {
      type: "disclosure-topics";
      task: FrontendTask | null;
      topics: string[];
      assessmentId: number;
    };

export function UserTasksCoordinator({ onBack }: UserTasksCoordinatorProps) {
  const [viewState, setViewState] = useState<ViewState>({ type: "task-list" });
  const { dispatch } = useAssessment();

  const handleNoTasks = () => {
    setViewState({ type: "disclosure-topics", task: null, topics: [], assessmentId: 0 });
  };

  const handleTaskSelect = async (task: FrontendTask, topics: string[], assessmentId: number) => {
    console.log(
      "Selected task:",
      task.taskName,
      "with topics:",
      topics,
      "assessmentId:",
      assessmentId
    );

    // Store assessment ID in context for all form submissions
    dispatch({ type: "SET_ASSESSMENT_ID", payload: assessmentId });

    // Mark this as an assigned task
    dispatch({ type: "SET_ASSIGNED_TASK", payload: true });

    // Determine if this is a continue scenario
    const isContinuing = task.status === "in_progress" || task.status === "completed";
    dispatch({ type: "SET_CONTINUE_MODE", payload: isContinuing });

    // If task is in progress or completed, load saved assessment data
    if (assessmentId && isContinuing) {
      try {
        console.log("Loading saved data for assessment:", assessmentId);

        // Fetch the assessment data from the API
        const response = await api.get(`/assessments/${assessmentId}`);

        if (response?.data) {
          const assessmentData = response.data.assessmentData || {};

          console.log("Loaded assessment data:", assessmentData);

          // Load the complete saved assessment data into context
          dispatch({
            type: "LOAD_SAVED_DATA",
            payload: {
              assessmentId,
              subsidiary: response.data.subsidiary || "",
              startMonth: response.data.startMonth || "",
              startYear: response.data.startYear || "",
              endMonth: response.data.endMonth || "",
              endYear: response.data.endYear || "",
              // Load all form data
              ...assessmentData,
            },
          });

          // Navigate to the disclosure topics view first
          setViewState({ type: "disclosure-topics", task, topics, assessmentId });

          // If there's a last saved form, navigate to it after a brief delay
          // This ensures the DisclosureTopics component is mounted first
          const lastSavedForm = assessmentData.lastSavedForm;
          if (lastSavedForm) {
            console.log("Navigating to last saved form:", lastSavedForm);
            setTimeout(() => {
              dispatch({ type: "SET_VIEW", payload: lastSavedForm });
            }, 100);
          }

          return;
        }
      } catch (error) {
        console.error("Failed to load saved assessment data:", error);
        // Show error message but allow user to continue
        alert("Could not load previously saved data. Starting fresh.");
      }
    }

    // Default behavior for new tasks: show disclosure topics
    setViewState({ type: "disclosure-topics", task, topics, assessmentId });
  };

  const handleBackFromDisclosureTopics = () => {
    // When backing out of disclosure topics, go back to task list
    // Don't clear the assigned task flag yet
    setViewState({ type: "task-list" });
  };

  const handleBackFromTaskList = () => {
    // When backing out of task list, clear flags and go to hub
    dispatch({ type: "SET_CONTINUE_MODE", payload: false });
    dispatch({ type: "SET_ASSIGNED_TASK", payload: false });
    onBack();
  };

  if (viewState.type === "task-list") {
    return (
      <MyTasksList
        onBack={handleBackFromTaskList}
        onTaskSelect={handleTaskSelect}
        onNoTasks={handleNoTasks}
      />
    );
  }

  if (viewState.type === "disclosure-topics") {
    return (
      <DisclosureTopics
        onBack={handleBackFromDisclosureTopics}
        assignedTask={viewState.task}
        assignedTopics={viewState.topics}
      />
    );
  }

  return null;
}
