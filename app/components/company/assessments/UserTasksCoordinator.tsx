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

    dispatch({ type: "SET_ASSESSMENT_ID", payload: assessmentId });

    dispatch({ type: "SET_ASSIGNED_TASK", payload: true });

    const isContinuing = task.status === "in_progress" || task.status === "completed";
    dispatch({ type: "SET_CONTINUE_MODE", payload: isContinuing });

    if (assessmentId && isContinuing) {
      try {
        console.log("Loading saved data for assessment:", assessmentId);

        const response = await api.get(`/assessments/${assessmentId}`);

        if (response?.data) {
          const assessmentData = response.data.assessmentData || {};

          // console.log("Loaded assessment data:", assessmentData);

          dispatch({
            type: "LOAD_SAVED_DATA",
            payload: {
              assessmentId,
              subsidiary: response.data.subsidiary || "",
              startMonth: response.data.startMonth || "",
              startYear: response.data.startYear || "",
              endMonth: response.data.endMonth || "",
              endYear: response.data.endYear || "",
              ...assessmentData,
            },
          });

          setViewState({ type: "disclosure-topics", task, topics, assessmentId });
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
        alert("Could not load previously saved data. Starting fresh.");
      }
    }

    setViewState({ type: "disclosure-topics", task, topics, assessmentId });
  };

  // const handleBackFromDisclosureTopics = () => {
  //   // When backing out of disclosure topics, go back to task list
  //   // Don't clear the assigned task flag yet
  //   setViewState({ type: "task-list" });
  // };

  const handleBackFromTaskList = () => {
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
        // onBack={handleBackFromDisclosureTopics}
        onBack={onBack}
        assignedTask={viewState.task}
        assignedTopics={viewState.topics}
      />
    );
  }

  return null;
}
