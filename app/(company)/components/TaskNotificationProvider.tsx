"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMyTasks } from "@/services/hooks/assignTask.hooks";
import TaskAssignmentDialog from "./TaskAssignmentDialog";

interface TaskNotificationContextType {
  hasTasks: boolean;
  isDialogOpen: boolean;
  isLoading: boolean;
  hasShownDialog: boolean;
}

const TaskNotificationContext = createContext<TaskNotificationContextType>({
  hasTasks: false,
  isDialogOpen: false,
  isLoading: true,
  hasShownDialog: false,
});

export const useTaskNotification = () => useContext(TaskNotificationContext);

interface TaskNotificationProviderProps {
  children: React.ReactNode;
}

export default function TaskNotificationProvider({ children }: TaskNotificationProviderProps) {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [hasShownDialog, setHasShownDialog] = useState(false);

  const { data: allTasks = [], isLoading } = useMyTasks({
    enabled: user?.role?.name !== "company_esg_admin" && !hasShownDialog,
  });

  // Filter tasks to only show those assigned to the logged-in user
  const myTasks = allTasks.filter((task) => {
    return task.assignedUserIds && task.assignedUserIds.includes(user?.id || 0);
  });

  useEffect(() => {
    // Only show dialog once per session when user logs in with tasks
    if (user && !isLoading && myTasks.length > 0 && !hasShownDialog) {
      console.log("TaskNotificationProvider: Showing dialog", {
        user: user.id,
        tasksCount: myTasks.length,
        tasks: myTasks,
      });
      // Small delay to ensure smooth transition after login
      const timer = setTimeout(() => {
        setShowDialog(true);
        setHasShownDialog(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, myTasks, isLoading, hasShownDialog]);

  // Reset the flag when user logs out (user becomes null)
  useEffect(() => {
    if (!user) {
      setHasShownDialog(false);
    }
  }, [user]);

  return (
    <TaskNotificationContext.Provider
      value={{
        hasTasks: myTasks.length > 0,
        isDialogOpen: showDialog,
        isLoading,
        hasShownDialog,
      }}
    >
      {children}
      {!isLoading && myTasks.length > 0 && (
        <TaskAssignmentDialog open={showDialog} onOpenChange={setShowDialog} tasks={myTasks} />
      )}
    </TaskNotificationContext.Provider>
  );
}
