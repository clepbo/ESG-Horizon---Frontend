import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../skeleton";

const LayoutContentSkeleton = () => {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-auto bg-gray-50 animate-pulse p-8"
      )}
    >
      <header className="h-16 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </header>
      <main className="py-6 flex-1 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LayoutContentSkeleton;
