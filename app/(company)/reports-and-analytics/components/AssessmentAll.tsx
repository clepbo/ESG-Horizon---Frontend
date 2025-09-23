import { Card, CardContent } from '@/app/components/ui/card'
import { Progress } from '@radix-ui/react-progress'
import { TrendingUp } from 'lucide-react'
import { GoDotFill } from "react-icons/go";
import React from 'react'

const data = [
    {
        title: "Total Emissions",
        value: 26230,
        unit: "tCO₂e",
        icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
        percentage: null,
    },
    {
        title: "Scope 1",
        value: 16300,
        unit: "tCO₂e",
        icon: <GoDotFill className="h-4 w-4 bg-orange-500 rounded-full  text-orange-500" />,
        colorClass: "bg-orange-500",
        percentage: 61,
    },
    {
        title: "Scope 2",
        value: 7500,
        unit: "tCO₂e",
        icon: <GoDotFill className="h-4 w-4 bg-blue-500 rounded-full  text-blue-500" />,
        colorClass: "bg-blue-500",
        percentage: 28,
    },
    {
        title: "Scope 3",
        value: 3030,
        unit: "tCO₂e",
        icon: <GoDotFill className="h-4 w-4 bg-green-500 rounded-full  text-green-500" />,
        colorClass: "bg-green-500",
        percentage: 11,
    },
]
export default function AssessmentAll() {
    return (
        <div className="w-full">
            <Card className="bg-white border-0 shadow-sm w-full">
                <CardContent className="p-6 lg:p-8">
                    <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-6">
                        Greenhouse Gas Emissions
                    </h2>
                    {/* Emissions Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {
                            data.map((item, index) => (

                                <Card className="bg-white shadow-sm border" key={index}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-sm font-medium text-muted-foreground"> {item.title} </h3>
                                            <div className={` rounded-full inline-block  ${item.colorClass}`}>
                                                {item.icon}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-semibold"> {item.value.toLocaleString()} </p>
                                            <p className="text-xs text-muted-foreground">{
                                                index === 0 ? item.unit : `${item.percentage}% of total emissions`
                                            }</p>
                                        </div>
                                    </CardContent>
                                </Card>

                            ))
                        }

                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Emission Summary */}
                        <Card className="bg-white shadow-sm border">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-medium text-foreground mb-6">Emission Summary</h3>
                                <div className="space-y-6">
                                    {/* Scope 1 */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between bg-">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full "></div>
                                                <span className="text-sm font-medium text-foreground">Scope 1</span>
                                            </div>
                                            <span className="text-sm font-medium text-foreground">16,300 tCO₂e (61%)</span>
                                        </div>
                                        <div className='w-full bg-green-200 h-2 rounded-2xl'>
                                            <Progress value={61} className="h-2 bg-green-500 rounded-2xl" style={{ width: '61%' }} />
                                        </div>
                                    </div>

                                    {/* Scope 2 */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full "></div>
                                                <span className="text-sm font-medium text-foreground">Scope 2</span>
                                            </div>
                                            <span className="text-sm font-medium text-foreground">7,500 tCO₂e (28%)</span>
                                        </div>
                                        <div className='w-full bg-green-200 h-2 rounded-2xl'>
                                            <Progress value={28} className="h-2 bg-green-500 rounded-2xl" style={{ width: '28%' }} />
                                        </div>
                                    </div>

                                    {/* Scope 3 */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full"></div>
                                                <span className="text-sm font-medium text-foreground">Scope 3</span>
                                            </div>
                                            <span className="text-sm font-medium text-foreground">3,030 tCO₂e (11%)</span>
                                        </div>

<div className='w-full bg-green-200 h-2 rounded-2xl'>
                                            <Progress value={41} className="h-2 bg-green-500 rounded-2xl" style={{ width: '41%' }} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assessment Data Count */}
                        <Card className="bg-white border shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-medium text-foreground mb-6">Assessment Data Count</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">Scope 1 Sources</span>
                                        <span className="text-sm text-muted-foreground">85% Complete</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">Scope 2 Sources</span>
                                        <span className="text-sm text-muted-foreground">95% Complete</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">Scope 3 Sources</span>
                                        <span className="text-sm text-muted-foreground">60% Complete</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
