"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/app/components/ui/accordion";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { GhgEmissionsAssessment } from "./industry-specific/environmental/ghg-emissions";

interface DisclosureTopicsProps {
    onBack: () => void;
}

interface MetricCard {
    title: string;
    subtitle: string;
    clickable?: boolean;
}

interface MetricSection {
    title: string;
    tooltip: string;
    cards: MetricCard[];
}

const industrySpecificMetrics: MetricSection[] = [
    {
        title: "Environment",
        tooltip: "Environmental sustainability metrics and indicators",
        cards: [
            {
                title: "Greenhouse Gas Emissions",
                subtitle: "Report total CO2-equivalent emissions from Subsidiaries and supply chains",
                clickable: true,
            },
            {
                title: "Air Quality",
                subtitle: "Assess pollutant emissions and their impact on local air quality",
            },
            {
                title: "Water Management",
                subtitle: "Evaluate water use, conservation, and treatment practices",
            },
            {
                title: "Biodiversity Impact",
                subtitle: "Identify and measure impacts on ecosystems, species, and natural habitats",
            },
        ],
    },
    {
        title: "Social Capital",
        tooltip: "Community and stakeholder relationship metrics",
        cards: [
            {
                title: "Security, Human Rights & Rights of Indigenous Peoples",
                subtitle:
                    "Asess how rights, safety, and cultural heritage are safegiarded in Subsidiaryal areas",
            },
            {
                title: "Community Relations",
                subtitle: "Report engagement strategies and impact on local  communities",
            },
        ],
    },
    {
        title: "Human Capital",
        tooltip: "Employee-related sustainability metrics",
        cards: [
            {
                title: "Workforce Health & Safety",
                subtitle: "Evaluate measures taken to protect employee well-being and prevent workplace accidents",
            },
        ],
    },
    {
        title: "Business Model and Innovation",
        tooltip: "Strategic business sustainability metrics",
        cards: [
            {
                title: "Reserves Valuation & Capital Expenditures",
                subtitle: "Report on investment strategies and valuation of natural rsource reserves",
            },
        ],
    },
    {
        title: "Business and Governance",
        tooltip: "Corporate governance and compliance metrics",
        cards: [
            {
                title: "Business Ethics & Transparency",
                subtitle: "Assess anti-corruption measures and Subsidiaryal integrity",
            },
            {
                title: "Management of the Legal & Regulatory Environment",
                subtitle: "Evaluate compliance with applicable laws and regulations",
            },
            {
                title: "Critical Incident Risk Management",
                subtitle: "Report preparedness plans and response strategies for major Subsidiaryal incidents",
            },
        ],
    },
];

const supplementaryMetrics: MetricSection[] = [
    {
        title: "Environment",
        tooltip: "Additional environmental metrics",
        cards: [
            {
                title: "Waste Management",
                subtitle: "Waste reduction and recycling programs",
            },
            {
                title: "Energy Efficiency",
                subtitle: "Energy consumption and efficiency metrics",
            },
        ],
    },
    {
        title: "Social Capital",
        tooltip: "Additional social impact metrics",
        cards: [
            {
                title: "Stakeholder Engagement",
                subtitle: "Stakeholder consultation and feedback systems",
            },
            {
                title: "Local Economic Impact",
                subtitle: "Economic contribution to local communities",
            },
        ],
    },
    {
        title: "Human Capital",
        tooltip: "Additional workforce metrics",
        cards: [
            {
                title: "Diversity & Inclusion",
                subtitle: "Workforce diversity and inclusion programs",
            },
            {
                title: "Training & Development",
                subtitle: "Employee skill development and training programs",
            },
        ],
    },
    {
        title: "Business Model and Innovation",
        tooltip: "Additional business strategy metrics",
        cards: [
            {
                title: "Innovation Investment",
                subtitle: "R&D spending on sustainable technologies",
            },
            {
                title: "Supply Chain Management",
                subtitle: "Sustainable supply chain practices",
            },
        ],
    },
    {
        title: "Business and Governance",
        tooltip: "Additional governance metrics",
        cards: [
            {
                title: "Board Composition",
                subtitle: "Board diversity and independence metrics",
            },
            {
                title: "Executive Compensation",
                subtitle: "ESG-linked executive compensation structures",
            },
        ],
    },
];

export function DisclosureTopics({ onBack }: DisclosureTopicsProps) {
    const [currentView, setCurrentView] = useState<"topics" | "ghg">("topics");

    const handleCardClick = (cardTitle: string) => {
        if (cardTitle === "Greenhouse Gas Emissions") {
            setCurrentView("ghg");
        }
    };

    const handleBackToHub = () => {
        onBack();
    };

    if (currentView === "ghg") {
        return (
            <GhgEmissionsAssessment
                onBack={() => setCurrentView("topics")}
                onBackToHub={handleBackToHub}
            />
        );
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-green-50 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="flex items-center gap-2 bg-white mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>

                    <Card className="bg-gray-50 p-8 rounded-xl shadow-none ">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-4">
                                    <h1 className="text-2xl font-bold text-foreground">
                                        Disclosure Topics
                                    </h1>
                                    <p className="text-muted-foreground text-base">
                                        Disclosure topics are industry-based versions of sustainability-related risks and<br/>opportunities
                                    </p>
                                </div>
                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                    Assign Task
                                </Button>
                            </div>

                            <Accordion
                                type="multiple"
                                className="space-y-6"
                                defaultValue={["industry-specific"]}
                            >
                                {/* Industry-Specific Metrics */}
                                <AccordionItem
                                    value="industry-specific"
                                    className="border-none"
                                >
                                    <AccordionTrigger className="py-4 px-0 hover:no-underline hover:cursor-pointer bg-transparent">
                                        <div className="flex items-center w-full relative">
                                            <span className="text-lg font-semibold flex items-center gap-2">
                                                Industry-Specific Metrics
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-4 w-4 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" align="start">
                                                        <p>Metrics specific to your industry sector</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </span>
                                            <span className="flex-1 h-0.5 bg-gray-300 mx-3 self-center" />
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6 px-0">
                                        <div className="space-y-8">
                                            {industrySpecificMetrics.map(
                                                (section) => (
                                                    <div
                                                        key={section.title}
                                                        className="space-y-4"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2 relative">
                                                            <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                                                                {section.title}
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Info className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" align="start">
                                                                        <p>{section.tooltip}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </h4>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {section.cards.map(
                                                                (card) => (
                                                                    <Card
                                                                        key={card.title}
                                                                        className={`transition-colors shadow-sm bg-white rounded-lg border ${
                                                                            card.clickable
                                                                                ? "cursor-pointer hover:bg-accent/50"
                                                                                : "cursor-default"
                                                                        }`}
                                                                        onClick={() =>
                                                                            card.clickable &&
                                                                            handleCardClick(card.title)
                                                                        }
                                                                    >
                                                                        <CardContent className="p-4">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="space-y-1 flex-1">
                                                                                    <h5 className="font-medium text-foreground">
                                                                                        {card.title}
                                                                                    </h5>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        {card.subtitle}
                                                                                    </p>
                                                                                </div>
                                                                                <ChevronRight className="h-7 w-7 text-muted-foreground flex-shrink-0 ml-2" />
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Supplementary Metrics */}
                                <AccordionItem
                                    value="supplementary"
                                    className="border-none"
                                >
                                    <AccordionTrigger className="py-4 px-0 hover:no-underline hover:cursor-pointer bg-transparent">
                                        <div className="flex items-center w-full relative">
                                            <span className="text-lg font-semibold flex items-center gap-2">
                                                Supplementary Metrics
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-4 w-4 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" align="start">
                                                        <p>Additional metrics to complement core reporting</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </span>
                                            <span className="flex-1 h-0.5 bg-gray-300 mx-3 self-center" />
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6 px-0">
                                        <div className="space-y-8">
                                            {supplementaryMetrics.map(
                                                (section) => (
                                                    <div
                                                        key={section.title}
                                                        className="space-y-4"
                                                    >
                                                        <div className="flex items-center gap-2 mb-2 relative">
                                                            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                                                                {section.title}
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Info className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" align="start">
                                                                        <p>{section.tooltip}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </h3>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {section.cards.map(
                                                                (card) => (
                                                                    <Card
                                                                        key={card.title}
                                                                        className="shadow-sm bg-white rounded-lg border cursor-default"
                                                                    >
                                                                        <CardContent className="p-4">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="space-y-1 flex-1">
                                                                                    <h4 className="font-medium text-foreground">
                                                                                        {card.title}
                                                                                    </h4>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        {card.subtitle}
                                                                                    </p>
                                                                                </div>
                                                                                <ChevronRight className="h-7 w-7 text-muted-foreground flex-shrink-0 ml-2" />
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TooltipProvider>
    );
}
