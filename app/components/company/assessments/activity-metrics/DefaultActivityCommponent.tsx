import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { CustomBreadcrumbDynamic } from "@/app/components/ui/CustomBreadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ChevronRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  handleClick: (index: number) => void;
}

export function DefaultActivityComponent({ handleClick }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <CustomBreadcrumbDynamic features={[]} />
      <div className="max-w-7xl mx-auto space-y-6 mt-4">
        <Card className="bg-white min-h-screen">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Activity Metrics</h3>
                <p className="text-muted-foreground text-sm">
                  This disclosure topic provides the fundamental quantitative data on the scale of
                  the company&aposs core operations, including production volumes and the number of
                  operational sites, which serve as a baseline for normalizing other performance
                  metrics. IFRS codes: EM-EP-000.A, EM-EP-000.B, EM-EP-000.C
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-teal-600 text-white"
                onClick={() =>
                  router.push(
                    `/assessments/tasks/assign?topic=${encodeURIComponent(
                      "Business Ethics & Transparency"
                    )}`
                  )
                }
              >
                Assign Task
              </Button>
            </div>

            <div className="space-y-6">
              {/* Geopolitical & Corruption Risk Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold">Production Data </h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                    >
                      <h6 className="font-semibold mb-1"> Production Data </h6>
                      <p>
                        This section captures your company’s production output across various
                        hydrocarbon streams. Enter accurate volumes for the reporting period to
                        support emissions calculation and operational benchmarking.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Card
                  className={`transition-all shadow-sm bg-white rounded-lg cursor-pointer hover:bg-accent/50 hover:shadow-md max-w-md`}
                  onClick={() => handleClick(1)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-foreground">Production Volumes</h5>
                          {/* <CompletionIndicator status={getStatus(card.title)} /> */}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This form covers metric EM-EP-000.A, focusing on the average daily
                          production of oil and natural gas.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-7 w-7 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </div>

              {/* Anti-Corruption Management Section */}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold"> Asset Portfolio </h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
                    >
                      <h6 className="font-semibold mb-1"> Asset Portfolio </h6>
                      <p>
                        This section captures the number and type of operational assets your company
                        manages. Asset counts help define operational boundaries and contextualize
                        environmental impacts.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card
                    className="transition-colors bg-white border shadow-sm rounded-lg cursor-pointer hover:bg-accent/50"
                    onClick={() => handleClick(2)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-medium text-foreground">Offshore Sites</h5>
                          <p className="text-sm text-muted-foreground">
                            This form covers metric EM-EP-000.B, which is specific to the number of
                            operational offshore sites.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className="transition-colors bg-white border shadow-sm rounded-lg cursor-pointer hover:bg-accent/50"
                    onClick={() => handleClick(3)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-medium text-foreground">Terrestrial Sites</h5>
                          <p className="text-sm text-muted-foreground">
                            This form covers metric EM-EP-000.C, which is specific to the number of
                            operational onshore sites.
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
