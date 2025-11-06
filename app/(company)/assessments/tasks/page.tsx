// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Plus } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
// import { Button } from "@/app/components/ui/button";
// import { TaskTable } from "@/app/components/company/tasks/TaskTable";
// import { TaskDetailDrawer } from "@/app/components/company/tasks/TaskDetailDrawer";
// import { AssignTaskDialog } from "@/app/components/company/tasks/AssignTaskDialog";

// type TaskStatus = "pending" | "in-progress" | "completed" | "on-hold" | "approved" | "rejected";
// export interface ITask {
//   id: string;
//   taskName: string;
//   assignedTo: string;
//   dateAssigned: string;
//   dueDate: string;
//   progress: number;
//   status: TaskStatus;
//   description?: string;
//   priority?: "low" | "medium" | "high";
// }

// const mockTasks: ITask[] = [
//   {
//     id: "1",
//     taskName: "Design new landing page",
//     assignedTo: "Ada Lovelace",
//     dateAssigned: "2025-11-01",
//     dueDate: "2025-11-15",
//     progress: 75,
//     status: "in-progress",
//     description:
//       "Create a modern, responsive landing page for the new product launch. Include hero section, features, testimonials, and CTA.",
//     priority: "high",
//   },
//   {
//     id: "2",
//     taskName: "Update user documentation",
//     assignedTo: "Julious Aghahowa",
//     dateAssigned: "2025-11-02",
//     dueDate: "2025-11-10",
//     progress: 100,
//     status: "completed",
//     description:
//       "Revise and update all user-facing documentation to reflect the latest product changes.",
//     priority: "medium",
//   },
//   {
//     id: "3",
//     taskName: "Implement authentication system",
//     assignedTo: "KCee Limpopo",
//     dateAssigned: "2025-11-03",
//     dueDate: "2025-11-20",
//     progress: 40,
//     status: "in-progress",
//     description:
//       "Build a secure authentication system with OAuth support and multi-factor authentication.",
//     priority: "high",
//   },
//   {
//     id: "4",
//     taskName: "Database optimization",
//     assignedTo: "Abubakar Tafawa-Balewa",
//     dateAssigned: "2025-11-04",
//     dueDate: "2025-11-12",
//     progress: 0,
//     status: "pending",
//     description:
//       "Optimize database queries and add proper indexing to improve application performance.",
//     priority: "medium",
//   },
//   {
//     id: "5",
//     taskName: "Mobile app testing",
//     assignedTo: "Sherlock Holmes",
//     dateAssigned: "2025-11-01",
//     dueDate: "2025-11-08",
//     progress: 60,
//     status: "on-hold",
//     description:
//       "Comprehensive testing of the mobile application across different devices and OS versions.",
//     priority: "high",
//   },
//   {
//     id: "6",
//     taskName: "Marketing campaign analysis",
//     assignedTo: "Jim Moriarty",
//     dateAssigned: "2025-10-28",
//     dueDate: "2025-11-06",
//     progress: 100,
//     status: "approved",
//     description:
//       "Analyze the performance metrics of Q4 marketing campaigns and provide actionable insights.",
//     priority: "low",
//   },
//   {
//     id: "7",
//     taskName: "API integration",
//     assignedTo: "Irene Adler",
//     dateAssigned: "2025-11-05",
//     dueDate: "2025-11-25",
//     progress: 20,
//     status: "in-progress",
//     description: "Integrate third-party payment processing API and ensure PCI compliance.",
//     priority: "high",
//   },
//   {
//     id: "8",
//     taskName: "Security audit report",
//     assignedTo: "Dr. John Watson",
//     dateAssigned: "2025-10-30",
//     dueDate: "2025-11-05",
//     progress: 100,
//     status: "rejected",
//     description:
//       "Conduct comprehensive security audit and document all findings with remediation steps.",
//     priority: "high",
//   },
// ];

// export default function TasksPage() {
//   const router = useRouter();
//   const [showReportSuccess, setShowReportSuccess] = useState(false);
//   const [_modalData, setModalData] = useState({
//     open: false,
//     assessmentId: null as number | null,
//   });
//   const [_detailsOpen, setDetailsOpen] = useState(false);
//   const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
//   const [reasonOpen, setReasonOpen] = useState(false);
//   const [selectedReason, setSelectedReason] = useState<string | undefined>(undefined);

//   const handleViewTask = (task: ITask) => {
//     setSelectedTask(task);
//     setIsDetailDrawerOpen(true);
//   };

//   const handleOpenReason = (reason: string | undefined) => {
//     setSelectedReason(reason);
//     setReasonOpen(true);
//   };

//   // const handleDeleteConfirm = () => {
//   //   const idToDelete = modalData.assessmentId;
//   //   if (!idToDelete) return;

//   //   deleteMutation.mutate(idToDelete, {
//   //     onSuccess: () => setModalData({ open: false, assessmentId: null }),
//   //     onError: (error: Error) => {
//   //       console.error("Deletion failed:", error);
//   //       setModalData({ open: false, assessmentId: null });
//   //     },
//   //   });
//   // };

//   const handleDeleteTask = (taskId: string) => {
//     const task = tasks.find((t) => t.id === taskId);
//     setTasks(tasks.filter((t) => t.id !== taskId));
//     toast({
//       title: "Task Deleted",
//       description: `${task?.taskName} has been deleted.`,
//       variant: "destructive",
//     });
//   };

//   const handleReassignTask = (taskId: string) => {
//     const task = tasks.find((t) => t.id === taskId);
//     toast({
//       title: "Reassign Task",
//       description: `Reassigning task: ${task?.taskName}`,
//     });
//   };

//   const handleApproveTask = (taskId: string) => {
//     setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: "approved" as const } : t)));
//     const task = tasks.find((t) => t.id === taskId);
//     toast({
//       title: "Task Approved",
//       description: `${task?.taskName} has been approved.`,
//     });
//   };

//   const handleRejectTask = (taskId: string) => {
//     setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: "rejected" as const } : t)));
//     const task = tasks.find((t) => t.id === taskId);
//     toast({
//       title: "Task Rejected",
//       description: `${task?.taskName} has been rejected.`,
//       variant: "destructive",
//     });
//   };

//   const handleSendReminder = (taskId: string) => {
//     const task = tasks.find((t) => t.id === taskId);
//     toast({
//       title: "Reminder Sent",
//       description: `Reminder sent to ${task?.assignedTo} for task: ${task?.taskName}`,
//     });
//   };

//   const handleAssignTask = (taskData: any) => {
//     const newTask: ITask = {
//       id: String(tasks.length + 1),
//       ...taskData,
//     };
//     setTasks([newTask, ...tasks]);
//     toast({
//       title: "Task Assigned",
//       description: `${newTask.taskName} has been assigned to ${newTask.assignedTo}.`,
//     });
//   };

//   return (
//     <motion.main
//       className="flex-1 h-full min-h-screen overflow-y-auto p-6 bg-background"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{
//         type: "spring",
//         stiffness: 200,
//         damping: 25,
//         duration: 0.5,
//       }}
//     >
//       <div className="container mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="space-y- mb-6">
//             <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
//             <p className="text-base text-muted-foreground">
//               Keep track of all assessment and reporting tasks assigned across teams and
//               departments.
//             </p>
//           </div>
//           <Button onClick={() => setIsAssignDialogOpen(true)} size="sm" className="text-white">
//             <Plus className="mr-2 h-5 w-5" />
//             Assign Task
//           </Button>
//         </div>

//         {/* Task Table */}
//         <section className="shadow-md">
//           <TaskTable
//             tasks={tasks}
//             onViewTask={handleViewTask}
//             onEditTask={handleEditTask}
//             onDeleteTask={handleDeleteTask}
//             onReassignTask={handleReassignTask}
//             onApproveTask={handleApproveTask}
//             onRejectTask={handleRejectTask}
//             onSendReminder={handleSendReminder}
//           />
//         </section>

//         {/* Task Detail Drawer */}
//         <TaskDetailDrawer
//           task={selectedTask}
//           open={isDetailDrawerOpen}
//           onOpenChange={setIsDetailDrawerOpen}
//         />

//         {/* Assign Task Dialog */}
//         <AssignTaskDialog
//           open={isAssignDialogOpen}
//           onOpenChange={setIsAssignDialogOpen}
//           onSubmit={handleAssignTask}
//         />
//       </div>
//     </motion.main>
//   );
// }
