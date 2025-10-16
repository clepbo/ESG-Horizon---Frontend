import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const CardSkeleton = () => {
  return (
    <div className={cn("flex flex-col flex-1 overflow-auto bg-gray-50 animate-pulse")}>
      <div className=" space-y-6 animate-pulse">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-60 mb-4" />
          <div className="flex items-center justify-between py-4">
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <hr className="border-gray-200" />
          <div className="flex items-center justify-between py-4">
            <div className="space-y-1">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
