"use client";

import { useState } from "react";
import { MyTasksList } from "./MyTasksList";
import { DisclosureTopics } from "./DisclosureTopics";
import { FrontendTask } from "@/services/assignTask.service";

interface UserTasksCoordinatorProps {
  onBack: () => void;
}

type ViewState =
  | { type: "task-list" }
  | { type: "disclosure-topics"; task: FrontendTask | null; topics: string[] };

/**
 * Coordinator component that manages the flow:
 * 1. Show user their assigned tasks (MyTasksList)
 * 2. If no tasks assigned, automatically show full DisclosureTopics
 * 3. When they select a task, show filtered DisclosureTopics
 * 4. DisclosureTopics only shows topics assigned in that specific task
 */
export function UserTasksCoordinator({ onBack }: UserTasksCoordinatorProps) {
  const [viewState, setViewState] = useState<ViewState>({ type: "task-list" });

  // Handle when user has no assigned tasks - show full disclosure topics
  const handleNoTasks = () => {
    setViewState({ type: "disclosure-topics", task: null, topics: [] });
  };

  // Step 1: Show the list of tasks assigned to this user
  if (viewState.type === "task-list") {
    return (
      <MyTasksList
        onBack={onBack}
        onTaskSelect={(task, topics) => {
          console.log("Selected task:", task.taskName, "with topics:", topics);
          setViewState({ type: "disclosure-topics", task, topics });
        }}
        onNoTasks={handleNoTasks}
      />
    );
  }

  // Step 2: Show disclosure topics (filtered by task if task exists, or show all if no task)
  if (viewState.type === "disclosure-topics") {
    return (
      <DisclosureTopics
        onBack={() => {
          // If there was no task (user had no assignments), go back to main hub
          // Otherwise, go back to task list
          if (viewState.task === null) {
            onBack();
          } else {
            setViewState({ type: "task-list" });
          }
        }}
        assignedTask={viewState.task}
        assignedTopics={viewState.topics}
      />
    );
  }

  return null;
}
