"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card } from "@/app/components/ui/card";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Loader2,
  Minus,
  Search,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/app/components/ui/calendar";
import React from "react";
import { useAllTasks, useAssignTask, useEditTask } from "@/services/hooks/assignTask.hooks";
import { toast } from "react-toastify";
import { AssignSuccessModal } from "@/app/components/company/tasks/AssignSuccessModal";
import { useCompanyDetails, useCompanyUsers } from "@/services/hooks/company.hooks";
import { FrontendTask } from "@/services/assignTask.service";
import InviteUserModal from "@/app/(company)/components/InviteUserModal";
import { useCompanyDepartments } from "@/services/hooks/department.hooks";

interface Topic {
  name: string;
  children?: Topic[];
}

interface SelectionState {
  checked: boolean;
  indeterminate: boolean;
}

interface CustomCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = React.forwardRef<
  HTMLDivElement,
  CustomCheckboxProps
>(({ checked, indeterminate, onCheckedChange, ...props }, ref) => (
  <div
    className={cn(
      "w-5 h-5 border-2 rounded-md flex items-center justify-center cursor-pointer transition-all shrink-0",
      checked || indeterminate ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300",
      props.className
    )}
    onClick={() => onCheckedChange(!checked)}
    ref={ref}
    {...props}
  >
    {indeterminate ? (
      <Minus size={16} className="text-white" />
    ) : checked ? (
      <svg
        className="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
    ) : null}
  </div>
));
CustomCheckbox.displayName = "CustomCheckbox";

const topicsData: Topic[] = [
  {
    name: "Environmental",
    children: [
      {
        name: "GreenHouse Gas Emissions",
        children: [
          {
            name: "Scope 1",
            children: [
              { name: "Stationary Sources" },
              { name: "Mobile Sources" },
              { name: "Process Emissions" },
              { name: "Fugitive Emissions" },
            ],
          },
          {
            name: "Scope 2",
            children: [{ name: "Location-based emissions" }, { name: "Market-based emissions" }],
          },
          { name: "Scope 3" },
        ],
      },
      { name: "Air Quality" },
      { name: "Water and Wastewater Management" },
      { name: "Biodiversity Impact" },
    ],
  },
  {
    name: "Social Capital",
    children: [
      { name: "Security, Human Rights & Rights of Indigenous Peoples" },
      { name: "Community Relations" },
    ],
  },
  {
    name: "Human Capital",
    children: [
      { name: "Employee Training & Development" },
      { name: "Workforce Health & Safety" },
      { name: "Diversity & Inclusion" },
    ],
  },
  {
    name: "Business Model Innovation",
    children: [
      { name: "Reserves Valuation & Capital Expenditures" },
      { name: "Business Ethics & Transparency" },
    ],
  },
];

const findAllDescendants = (topic: Topic): string[] => {
  let names: string[] = [];
  if (topic.children) {
    topic.children.forEach((child) => {
      names.push(child.name);
      names = names.concat(findAllDescendants(child));
    });
  }
  return names;
};

const getSelectionState = (topic: Topic, selectedTopics: string[]): SelectionState => {
  const descendants = findAllDescendants(topic);
  if (descendants.length === 0) {
    return { checked: selectedTopics.includes(topic.name), indeterminate: false };
  }

  const selectedDescendants = descendants.filter((name) => selectedTopics.includes(name));

  const isFullySelected = selectedDescendants.length === descendants.length;
  const isPartiallySelected =
    selectedDescendants.length > 0 && selectedDescendants.length < descendants.length;

  return {
    checked: isFullySelected,
    indeterminate: isPartiallySelected,
  };
};

export default function AssignTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const { data: tasks } = useAllTasks();
  const assignTaskMutation = useAssignTask();
  const { data: companyDetails } = useCompanyDetails();
  const companyId = Number(companyDetails?.id);
  const { data: teamMembers } = useCompanyUsers(String(companyId));
  const { data: departments } = useCompanyDepartments(companyId);

  const [taskName, setTaskName] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [sendEmail, setSendEmail] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [initialData, setInitialData] = useState<FrontendTask | null>(null);
  const editTaskMutation = useEditTask();

  useEffect(() => {
    const topicParam = searchParams.get("topic");
    const selectAllParam = searchParams.get("selectAll");

    if (selectAllParam === "true" && !editId) {
      // Select ALL topics
      const allTopics: string[] = [];
      const traverse = (list: Topic[]) => {
        list.forEach((t) => {
          allTopics.push(t.name);
          if (t.children) traverse(t.children);
        });
      };
      traverse(topicsData);
      setSelectedTopics(allTopics);
      // Optional: expand all top level?
      setExpandedTopics(topicsData.map((t) => t.name));
      return;
    }

    if (topicParam && !editId) {
      // Find the topic object to match exactly or just add it strings
      // Using toggleSelectTopic logic requires traversing, but for simply adding we can check existence
      // However, we want to maintain the "toggle" logic consistency if possible, or just force add it.
      // Let's force add it to selectedTopics if not already there.

      const topicName = decodeURIComponent(topicParam);
      setSelectedTopics((prev) => {
        if (prev.includes(topicName)) return prev;

        // Also simple logic: just add it. The "renderTopics" calculates indeterminate state based on this list.
        // Ideally we should include descendants if the user expects "Selecting GHG" means "Selecting all GHG",
        // but "toggleSelectTopic" does that. Let's call it?
        // We can't call toggleSelectTopic easily in useEffect because it relies on state updater.
        // We'll mimic the logic: find topic, get descendants, add all.

        const findTopic = (list: Topic[]): Topic | undefined => {
          for (const topic of list) {
            if (topic.name.toLowerCase() === topicName.toLowerCase()) return topic;
            if (topic.children) {
              const found = findTopic(topic.children);
              if (found) return found;
            }
          }
          return undefined;
        };

        const topic = findTopic(topicsData);
        if (topic) {
          const descendants = findAllDescendants(topic);
          const allRelated = [topic.name, ...descendants];
          return Array.from(new Set([...prev, ...allRelated]));
        }

        return prev;
      });
      // Also expand the tree to show the topic? Optional but nice.
      setExpandedTopics((prev) => [...prev, topicName]);
    }
  }, [searchParams, editId]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (date >= tomorrow) {
      setDueDate(date);
    } else {
      toast.warn("Please select a date from tomorrow onwards");
    }
  };

  useEffect(() => {
    if (editId && tasks) {
      const task = tasks.find((t) => t.id === Number(editId));
      if (task) {
        setInitialData(task);
        setTaskName(task.taskName);
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setSelectedTopics(task.topics || []);

        if (task.teamMembers && task.teamMembers.length > 0 && teamMembers) {
          const memberName = task.teamMembers[0];
          const member = teamMembers.find(
            (m) => `${m.first_name} ${m.last_name}`.trim() === memberName
          );

          if (member) {
            setSelectedMember(String(member.id));
          }
        }
        // Always send email for new tasks, but respect saved setting for edits?
        // Request says "Remove the checkbox and make notifications automatic."
        // So we will force it to true always unless we really want to preserve legacy data.
        setSendEmail(true);
      }
    }
  }, [editId, tasks, teamMembers]);

  const toggleExpand = (name: string) => {
    setExpandedTopics((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const toggleSelectTopic = (name: string) => {
    const findTopic = (list: Topic[]): Topic | undefined => {
      for (const topic of list) {
        if (topic.name === name) return topic;
        if (topic.children) {
          const found = findTopic(topic.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const topic = findTopic(topicsData);
    if (!topic) return;

    const descendants = findAllDescendants(topic);
    const allRelated = [topic.name, ...descendants];

    setSelectedTopics((prev) => {
      const isSelected = prev.includes(topic.name);

      if (isSelected) {
        return prev.filter((t) => !allRelated.includes(t));
      } else {
        return Array.from(new Set([...prev, ...allRelated]));
      }
    });
  };

  const filteredTopics: Topic[] = useMemo(() => {
    if (!searchTerm) return topicsData;

    const filterRecursive = (list: Topic[]): Topic[] => {
      const filtered: Topic[] = [];
      list.forEach((topic) => {
        const matches: boolean = topic.name.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredChildren: Topic[] = topic.children ? filterRecursive(topic.children) : [];

        if (matches || filteredChildren.length > 0) {
          filtered.push({
            ...topic,
            children: filteredChildren.length > 0 ? filteredChildren : topic.children,
          });
        }
      });
      return filtered;
    };
    return filterRecursive(topicsData);
  }, [searchTerm]);

  const renderTopics = (list: Topic[], depth: number = 0): JSX.Element => (
    <div className="space-y-1">
      {list.map((topic) => {
        const { checked, indeterminate } = getSelectionState(topic, selectedTopics);
        const isExpanded = expandedTopics.includes(topic.name);

        const paddingLeft = `${depth * 1}rem`;

        return (
          <div key={topic.name} style={{ paddingLeft }}>
            <div
              className={cn(
                "flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm transition-all",
                "hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2 grow">
                <CustomCheckbox
                  checked={checked}
                  indeterminate={indeterminate}
                  onCheckedChange={() => toggleSelectTopic(topic.name)}
                  className={cn(
                    checked || indeterminate
                      ? "bg-green-600 border border-green-600 text-white"
                      : "bg-white border border-green-600 text-green-600",
                    "w-5 h-5 rounded-sm flex items-center justify-center cursor-pointer transition-all shrink-0"
                  )}
                />

                <span
                  className="text-gray-800 font-small cursor-pointer select-none"
                  onClick={() => toggleSelectTopic(topic.name)}
                >
                  {topic.name}
                </span>
              </div>

              {topic.children && topic.children.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleExpand(topic.name)}
                  className="cursor-pointer p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              )}
            </div>

            {topic.children && isExpanded && (
              <div className="mt-1">{renderTopics(topic.children, depth + 1)}</div>
            )}
          </div>
        );
      })}
    </div>
  );

  const handleSubmit = async () => {
    if (!taskName || !selectedMember || !dueDate || selectedTopics.length === 0) {
      toast.warn("Please fill in all required fields");
      return;
    }

    try {
      setIsAssigning(true);

      if (initialData) {
        await editTaskMutation.mutateAsync({
          id: initialData.id,
          payload: {
            taskName,
            dueDate: dueDate?.toISOString(),
            userIds: [Number(selectedMember)],
            topics: selectedTopics,
            sendEmail,
          },
        });
        await toast.success("Task updated successfully");
        setTaskName("");
        setSelectedMember("");
        setDueDate(undefined);
        setSendEmail(false);
        setSelectedTopics([]);
        setSearchTerm("");
      } else {
        await assignTaskMutation.mutateAsync({
          taskName,
          dueDate: dueDate?.toISOString(),
          userIds: [Number(selectedMember)],
          topics: selectedTopics,
          sendEmail,
        });
        setIsSuccessModalOpen(true);
      }

      setIsAssigning(false);
    } catch (error) {
      setIsAssigning(false);
      toast.error("Error Assigning Task");
      console.error(error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft size={18} /> <span className="text-sm">Back</span>
        </Button>
        <div className="ml-2">
          <h1 className="text-2xl font-semibold">Assign Task</h1>
        </div>
      </div>

      <Card className="p-6 border border-gray-200 space-y-6">
        <div className="space-y-2">
          <Label>Task Name</Label>
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label>Select Department / Team Member</Label>
            <select
              value={selectedMember}
              onChange={(e) => {
                if (e.target.value === "invite_new") {
                  setIsInviteModalOpen(true);
                  // Don't set selectedMember to 'invite_new'
                  return;
                }
                setSelectedMember(e.target.value);
              }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select a member</option>
              {teamMembers &&
                teamMembers.length > 0 &&
                teamMembers.map((member) => (
                  <option key={member.id} value={String(member.id)}>
                    {member.first_name} {member.last_name} ({member.email})
                  </option>
                ))}
              <option value="invite_new" className="font-semibold text-teal-600 bg-teal-50">
                + Invite New Member
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar selected={dueDate} onSelect={handleDateSelect} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Select the topic or assessment you would like to assign</Label>

          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for a topic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div>
            <div className="border border-gray-200 rounded-xl p-4 bg-white max-h-125 overflow-hidden shadow-inner">
              {filteredTopics.length > 0 ? (
                renderTopics(filteredTopics)
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-8">
                  No topics match your search.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="relative border border-gray-200 rounded-xl p-4 bg-white min-h-100 shadow-sm">
              {selectedTopics.length === 0 ? (
                <div className="absolute inset-4 flex items-center justify-center">
                  <p className="text-md text-gray-500 text-center">
                    No topic has been selected yet!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTopics.map((topic: string) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm text-teal-800"
                    >
                      <span>{topic}</span>
                      <button
                        onClick={() => toggleSelectTopic(topic)}
                        className="ml-2 p-1 rounded-full hover:bg-indigo-200 cursor-pointer transition-colors focus:outline-none"
                      >
                        <X size={14} className="text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button className="bg-primary text-white" onClick={handleSubmit} disabled={isAssigning}>
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Saving..." : "Assigning..."}
              </>
            ) : initialData ? (
              "Save"
            ) : (
              "Assign Task"
            )}
          </Button>
        </div>
      </Card>
      <AssignSuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onViewTask={() => router.push("/assessments/tasks")}
        onAssignAnother={() => {
          setIsSuccessModalOpen(false);
          setTaskName("");
          setSelectedMember("");
          setDueDate(undefined);
          setSendEmail(false);
          setSelectedTopics([]);
          setSearchTerm("");
        }}
        taskName={taskName}
        dueDate={dueDate ? format(dueDate, "PPP") : ""}
        departments={[]}
        teamMembers={teamMembers?.filter((m) => String(m.id) === selectedMember) || []}
        topics={selectedTopics}
      />
      {isInviteModalOpen && (
        <InviteUserModal
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={() => {
            // Optionally refresh team members here if not handled by hook re-fetch
            // The useCompanyUsers hook should auto-update if it uses react-query and we invalidate,
            // but InviteUserModal just calls service.invite.
            // We'll rely on global state update or manual refresh if needed.
            // For now just close modal.
            toast.success("Invitation sent. They will appear in the list once they accept.");
          }}
          departments={departments || []}
        />
      )}
    </div>
  );
}
