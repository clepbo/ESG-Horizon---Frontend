"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Textarea } from "@/app/components/ui/textarea";
import { useState } from "react";

const taskSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function AddTaskPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      console.log(data);
      toast.success("Task created successfully!");
      router.push("/assessment/tasks");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-10 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Top Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/assessment/tasks")}
            className="flex items-center gap-2 border-green-600 text-green-700 bg-white hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-semibold text-gray-900">Add New Task</h2>
        </div>

        {/* Card Wrapper */}
        <Card className="bg-white shadow-md border border-gray-200 rounded-xl">
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label className="text-sm font-medium text-gray-700">Task Title</Label>
                <Input
                  type="text"
                  placeholder="Enter task title"
                  {...register("title")}
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  placeholder="Enter detailed task description"
                  rows={4}
                  {...register("description")}
                  className="mt-1"
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Input type="date" {...register("dueDate")} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Assignee</Label>
                  <Input
                    type="text"
                    placeholder="Enter assignee name"
                    {...register("assignee")}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/assessment/tasks")}
                  className="border-green-600 text-green-700 hover:bg-green-50"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-500 text-white flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
