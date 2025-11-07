"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Card } from "@/app/components/ui/card";
import { CalendarIcon, ChevronDown, ChevronRight, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/app/components/ui/calendar";

export default function AssignTaskPage() {
  const router = useRouter();

  const [taskName, setTaskName] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [sendEmail, setSendEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const teamMembers = ["Tony Stark", "Bruce Banner", "Natasha Romanoff", "Steve Rogers"];
  const topics = [
    {
      name: "Nigeria",
      children: [
        {
          name: "FCT",
          children: [{ name: "Kubwa" }, { name: "Wuse" }],
        },
        {
          name: "Lagos",
          children: [{ name: "Ajegunle" }, { name: "Ikeja" }],
        },
      ],
    },
    {
      name: "Egypt",
      children: [{ name: "Almansourah" }, { name: "Cairo" }],
    },
  ];

  const toggleExpand = (name: string) => {
    setExpandedTopics((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const toggleSelectTopic = (name: string) => {
    setSelectedTopics((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const renderTopics = (list: any[], depth = 0) => (
    <div className="space-y-2">
      {list.map((topic) => (
        <div key={topic.name} className={`pl-${depth * 4}`}>
          <div className="flex items-center gap-2">
            {topic.children && (
              <button
                type="button"
                onClick={() => toggleExpand(topic.name)}
                className="focus:outline-none"
              >
                {expandedTopics.includes(topic.name) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            )}
            <Checkbox
              checked={selectedTopics.includes(topic.name)}
              onCheckedChange={() => toggleSelectTopic(topic.name)}
            />
            <span className="text-sm">{topic.name}</span>
          </div>

          {topic.children && expandedTopics.includes(topic.name) && (
            <div className="pl-6 mt-1 border-l border-gray-200">
              {renderTopics(topic.children, depth + 1)}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const handleSubmit = () => {
    console.log({
      taskName,
      selectedMember,
      dueDate,
      sendEmail,
      selectedTopics,
    });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Assign Task</h1>
          <p className="text-sm text-muted-foreground">
            Assign a new task to a department or team member
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      {/* Form Section */}
      <Card className="p-6 border border-gray-200 space-y-6">
        {/* Task Name */}
        <div className="space-y-2">
          <Label>Task Name</Label>
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
          />
        </div>

        {/* Member + Due Date */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label>Select Department / Team Member</Label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select a member</option>
              {teamMembers.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked === true)}
              />
              <span className="text-sm text-green-700 border border-green-500 rounded px-2 py-1">
                Send email notification to inform department team member
              </span>
            </div>
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
                <Calendar selected={dueDate} onSelect={setDueDate} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Topic Search */}
        <div className="space-y-2">
          <Label>Select the topic or assessment to assign</Label>
          <Input
            placeholder="Search for a topic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Topic Selector */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-medium mb-3">Available Topics</h3>
            <div className="border border-gray-200 rounded-md p-4 max-h-[400px] overflow-auto">
              {renderTopics(topics)}
            </div>
          </div>

          {/* Selected Topics */}
          <div>
            <h3 className="font-medium mb-3">Selected Topics</h3>
            <div className="border border-gray-200 rounded-md p-4 min-h-[400px]">
              {selectedTopics.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No topic selected yet!</p>
              ) : (
                <div className="space-y-2">
                  {selectedTopics.map((topic) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2 text-sm"
                    >
                      <span>{topic}</span>
                      <button
                        onClick={() => setSelectedTopics((prev) => prev.filter((t) => t !== topic))}
                      >
                        <X size={14} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button className="bg-[var(--color-primary)] text-white" onClick={handleSubmit}>
            Assign Task
          </Button>
        </div>
      </Card>
    </div>
  );
}
