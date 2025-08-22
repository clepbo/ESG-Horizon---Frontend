"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, ChevronRight, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { GhgEmissionsAssessment } from "./ghg-emissions-assessment"

interface DisclosureTopicsProps {
  onBack: () => void
}

interface MetricCard {
  title: string
  subtitle: string
  clickable?: boolean
}

interface MetricSection {
  title: string
  tooltip: string
  cards: MetricCard[]
}

const industrySpecificMetrics: MetricSection[] = [
  {
    title: "Environment",
    tooltip: "Environmental sustainability metrics and indicators",
    cards: [
      {
        title: "Greenhouse Gas Emissions",
        subtitle: "Track and report Scope 1, 2, and 3 emissions",
        clickable: true,
      },
      {
        title: "Air Quality",
        subtitle: "Monitor air pollutants and emission standards",
      },
      {
        title: "Water Management",
        subtitle: "Water usage, quality, and conservation metrics",
      },
      {
        title: "Biodiversity Impact",
        subtitle: "Environmental impact on local ecosystems",
      },
    ],
  },
  {
    title: "Social Capital",
    tooltip: "Community and stakeholder relationship metrics",
    cards: [
      {
        title: "Security, Human Rights & Rights of Indigenous Peoples",
        subtitle: "Human rights compliance and indigenous community relations",
      },
      {
        title: "Community Relations",
        subtitle: "Local community engagement and impact assessment",
      },
    ],
  },
  {
    title: "Human Capital",
    tooltip: "Employee-related sustainability metrics",
    cards: [
      {
        title: "Workforce Health & Safety",
        subtitle: "Employee safety incidents and health programs",
      },
    ],
  },
  {
    title: "Business Model and Innovation",
    tooltip: "Strategic business sustainability metrics",
    cards: [
      {
        title: "Reserves Valuation & Capital Expenditures",
        subtitle: "Asset valuation and sustainable investment tracking",
      },
    ],
  },
  {
    title: "Business and Governance",
    tooltip: "Corporate governance and compliance metrics",
    cards: [
      {
        title: "Business Ethics & Transparency",
        subtitle: "Ethics compliance and transparency reporting",
      },
      {
        title: "Management of the Legal & Regulatory Environment",
        subtitle: "Legal compliance and regulatory risk management",
      },
      {
        title: "Critical Incident Risk Management",
        subtitle: "Risk assessment and incident response protocols",
      },
    ],
  },
]

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
]

export function DisclosureTopics({ onBack }: DisclosureTopicsProps) {
  const [currentView, setCurrentView] = useState<"topics" | "ghg">("topics")

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === "Greenhouse Gas Emissions") {
      setCurrentView("ghg")
    }
  }

  const handleBackFromGhg = () => {
    setCurrentView("topics")
  }

  if (currentView === "ghg") {
    return <GhgEmissionsAssessment onBack={handleBackFromGhg} />
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">Disclosure Topics</h1>
                  <p className="text-muted-foreground">
                    Disclosure topics are industry-based versions of sustainability-related risks and opportunities
                  </p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white">Assign Task</Button>
              </div>
            </CardContent>
          </Card>

          {/* Accordions */}
          <Accordion type="single" defaultValue="industry-specific" className="space-y-4">
            {/* Industry-Specific Metrics */}
            <AccordionItem value="industry-specific" className="border-0">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">Industry-Specific Metrics</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Metrics specific to your industry sector</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-8">
                    {industrySpecificMetrics.map((section) => (
                      <div key={section.title} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-foreground">{section.title}</h3>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{section.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.cards.map((card) => (
                            <Card
                              key={card.title}
                              className={`transition-colors ${
                                card.clickable ? "cursor-pointer hover:bg-accent/50" : "cursor-default"
                              }`}
                              onClick={() => card.clickable && handleCardClick(card.title)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1 flex-1">
                                    <h4 className="font-medium text-foreground">{card.title}</h4>
                                    <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Supplementary Metrics */}
            <AccordionItem value="supplementary" className="border-0">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">Supplementary Metrics</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Additional metrics to complement core reporting</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-8">
                    {supplementaryMetrics.map((section) => (
                      <div key={section.title} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-foreground">{section.title}</h3>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{section.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.cards.map((card) => (
                            <Card key={card.title} className="cursor-default">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1 flex-1">
                                    <h4 className="font-medium text-foreground">{card.title}</h4>
                                    <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </TooltipProvider>
  )
}
