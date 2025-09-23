import { Card, CardContent } from '@/app/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const AssessmentAllSkeleton = () => {
    return (
        <div className="w-full">
            <Card className="bg-white border-0 shadow-sm w-full">
                <CardContent className="p-6 lg:p-8">
                    {/* Main Title Skeleton */}
                    <Skeleton className="h-7 w-[250px] mb-6" />
                    
                    {/* Emissions Cards Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Card className="bg-white shadow-sm border" key={index}>
                                <CardContent className="p-6">
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <Skeleton className="h-4 w-[100px]" />
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                    </div>
                                    
                                    {/* Card Content */}
                                    <div className="space-y-1">
                                        <Skeleton className="h-7 w-[80px]" />
                                        <Skeleton className="h-3 w-[120px]" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Bottom Section Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Emission Summary Skeleton */}
                        <Card className="bg-white shadow-sm border">
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-[150px] mb-6" />
                                <div className="space-y-6">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div className="space-y-2" key={index}>
                                            {/* Scope header */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="w-2 h-2 rounded-full" />
                                                    <Skeleton className="h-4 w-[70px]" />
                                                </div>
                                                <Skeleton className="h-4 w-[120px]" />
                                            </div>
                                            {/* Progress bar */}
                                            <Skeleton className="h-2 w-full rounded-2xl" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assessment Data Count Skeleton */}
                        <Card className="bg-white border shadow-sm">
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-[180px] mb-6" />
                                <div className="space-y-4">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div className="flex items-center justify-between" key={index}>
                                            <Skeleton className="h-4 w-[130px]" />
                                            <Skeleton className="h-4 w-[70px]" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AssessmentAllSkeleton