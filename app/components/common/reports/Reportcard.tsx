"use client";
import React, { useState } from "react";
import { Card, CardTitle } from "../../ui/card";
import { CustomProgressWithoutUnit } from "@/app/(company)/reports-and-analytics/components/charts/ProgressBar";
import { CustomButton } from "../../ui/reusables/CustomButton";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportcardProps {
  subsidiary: string;
  dateRange: string;
  status: "Completed" | "In Progress" | "Not Started" | "submitted_approved" | string;
  progress: number;
  id: number;
  done?: number;
  overall?: number;
}

export default function Reportcard({
  subsidiary,
  dateRange,
  id,
  status = "Completed",
  progress = 80,
  done = 12,
  overall = 100,
}: ReportcardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleRoute() {
    setIsLoading(true);
    try {
      await router.push(`/reports-and-analytics/${id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setIsLoading(false);
    }
  }

  console.log("DOne:", done, "Overall:", overall);
  return (
    <Card className="w-full h-64 flex flex-col p-4 gap-2 md:gap-4 justify-center">
      <CardTitle className=""> {subsidiary} </CardTitle>
      <div className="flex flex-col w-full">
        <span className="text-10"> {dateRange} </span>
        {status === "submitted_approved" && (
          <span className="flex justify-end text-xs  ">
            <span className="font-semibold bg-green-600 text-white p-1 rounded-2xl">{status}</span>
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <CustomProgressWithoutUnit
          value={progress}
          title="Progress"
          total={Number(progress)}
          percent={progress}
          unit="%"
          done={done}
          overall={overall}
        />
        {/* <p className='text-sm'> 8 of 8 sections completed</p> */}
      </div>
      <CustomButton
        variant={"outlined"}
        size={"lg"}
        className="w-full rounded p-2"
        icon={isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        onClick={handleRoute}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "View Report"}
      </CustomButton>
    </Card>
  );
}
