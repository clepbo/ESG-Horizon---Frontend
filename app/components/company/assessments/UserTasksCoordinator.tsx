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

export function UserTasksCoordinator({ onBack }: UserTasksCoordinatorProps) {
  const [viewState, setViewState] = useState<ViewState>({ type: "task-list" });

  const handleNoTasks = () => {
    setViewState({ type: "disclosure-topics", task: null, topics: [] });
  };

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

  if (viewState.type === "disclosure-topics") {
    return (
      <DisclosureTopics
        onBack={() => {
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
