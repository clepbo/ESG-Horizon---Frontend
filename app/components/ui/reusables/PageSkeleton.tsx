import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => {
  return (
    <div className={cn("flex flex-col flex-1 overflow-auto bg-gray-50 animate-pulse p-8")}>
      <header className="h-16 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </header>
      <div className="py-6 space-y-6 animate-pulse">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold">
            <Skeleton className="h-6 w-40" />
          </h2>
          <div className="flex items-center space-x-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>
        </div>
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

export default PageSkeleton;
