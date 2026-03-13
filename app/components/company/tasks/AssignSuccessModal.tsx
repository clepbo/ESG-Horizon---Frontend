"use client";

import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import CustomDialog from "../../ui/reusables/CustomDialog";

interface AssignSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onViewTask: () => void;
  onAssignAnother: () => void;
  taskName: string;
  dueDate: string;
  departments: string[];
  teamMembers: { id: number; first_name: string; last_name: string }[];
  topics: string[];
}

export function AssignSuccessModal({
  open,
  onClose,
  onViewTask,
  onAssignAnother,
  taskName,
  dueDate,
  departments,
  teamMembers,
  topics,
}: AssignSuccessModalProps) {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onClose}
      title=""
      className="p-10 rounded-2xl max-w-4xl bg-white max-h-[90vh] overflow-y-auto"
      offsetX={250}
    >
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative"
          >
            <svg width="100" height="100" viewBox="0 0 100 100" className="rounded-full">
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="#109b95"
                strokeWidth="4"
                fill="transparent"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              <motion.path
                d="M 30 50 L 45 65 L 70 35"
                stroke="#109b95"
                strokeWidth="6"
                fill="transparent"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial="hidden"
                animate="visible"
              />
            </svg>
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground text-center">
              Task Assigned Successfully!
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Task has been assigned to the selected team member/department. They will be notified
              and can now begin their assessment.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full mt-4">
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              onClick={onViewTask}
            >
              View Assigned Task
            </Button>
            <Button
              variant="outline"
              className="w-full border-teal-600 text-teal-700 hover:bg-teal-50"
              onClick={onAssignAnother}
            >
              Assign Another Task
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Task Details</h3>

          <Card className="bg-gray-50 border-gray-200 p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Task Name:</p>
              <p className="text-sm font-medium text-foreground">{taskName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Due Date:</p>
              <p className="text-sm font-medium text-foreground">{dueDate}</p>
            </div>
          </Card>

          <Card className="bg-white border-gray-200 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Assigned to</h4>

            {departments?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Departments:</p>
                <div className="flex flex-wrap gap-2">
                  {departments.map((dept, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded-full"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {teamMembers?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Team Members:</p>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map((member, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
                    >
                      {member.first_name} {member.last_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-white border-gray-200 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Topic Assigned</h4>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </CustomDialog>
  );
}
