"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useAssessment } from "@/hooks/useAssessment";
import { DisclosureTopics } from "@/app/components/company/assessments/DisclosureTopics";
import { UserTasksCoordinator } from "@/app/components/company/assessments/UserTasksCoordinator";
import Header from "../../components/Header";
import { useCompanySubsidiaries } from "@/services/hooks/subsidiaries.hooks";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AssessmentHub() {
  const { state, dispatch } = useAssessment();
  const { user } = useAuth();
  const router = useRouter();
  const [dateError, setDateError] = useState<string | null>(null);

  const { data: subsidiaries = [], isLoading, error } = useCompanySubsidiaries();

  // Reset state only for NEW assessments. When continuing an existing assessment,
  // ContinueAssessment has already loaded data and set isContinueMode before this mounts.
  useEffect(() => {
    if (!state.isContinueMode) {
      dispatch({ type: "RESET_ASSESSMENT" });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect(() => {
  //   if (state.targetStep) {
  //     setTargetStep(state.targetStep);
  //   }
  // }, [state.targetStep]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const result: string[] = [];
    for (let y = currentYear; y >= startYear; y--) {
      result.push(String(y));
    }
    return result;
  }, []);

  useEffect(() => {
    if (!isLoading && subsidiaries.length === 0 && !state.assessmentData.subsidiary) {
      dispatch({
        type: "UPDATE_BASIC_DATA",
        payload: {
          subsidiary: user?.company?.name || "Company",
        },
      });
    }
  }, [isLoading, subsidiaries, user, state.assessmentData.subsidiary, dispatch]);

  useEffect(() => {
    const { startMonth, startYear, endMonth, endYear } = state.assessmentData;
    if (!startMonth || !startYear || !endMonth || !endYear) {
      setDateError(null);
      return;
    }

    const startIndex = months.indexOf(startMonth);
    const endIndex = months.indexOf(endMonth);

    const start = new Date(Number(startYear), startIndex);
    const end = new Date(Number(endYear), endIndex);

    if (end < start) {
      setDateError("End date cannot be earlier than start date");
    } else {
      setDateError(null);
    }
  }, [
    state.assessmentData,
    state.assessmentData.startMonth,
    state.assessmentData.startYear,
    state.assessmentData.endMonth,
    state.assessmentData.endYear,
  ]);

  const handleProceed = async () => {
    const subsidiaryValue = state.assessmentData.subsidiary || user?.company?.name || "Self";

    dispatch({
      type: "UPDATE_BASIC_DATA",
      payload: {
        subsidiary: subsidiaryValue,
        startMonth: state.assessmentData.startMonth,
        startYear: state.assessmentData.startYear,
        endMonth: state.assessmentData.endMonth,
        endYear: state.assessmentData.endYear,
      },
    });

    // Check if user has assigned tasks - if yes, show tasks first, otherwise show all disclosure topics
    // Skip "My Tasks" for Company Admins as they don't have assigned tasks
    console.log("AssessmentHub handleProceed - User:", user);
    console.log("AssessmentHub handleProceed - Role:", user?.role?.name);

    if (user?.role?.name === "company_esg_admin") {
      dispatch({ type: "SET_VIEW", payload: "disclosure-topics" });
    } else {
      dispatch({ type: "SET_VIEW", payload: "my-tasks" });
    }
  };

  const handleBack = () => {
    if (state.isContinueMode) {
      router.back();
      return;
    }
    dispatch({ type: "SET_VIEW", payload: "hub" });
  };

  const handleInputChange = (field: string, value: string) => {
    dispatch({
      type: "UPDATE_BASIC_DATA",
      payload: { [field]: value },
    });
  };

  const backToNewAssessment = () => router.back();

  // NEW: Handle view for user's assigned tasks
  if (state.currentView === "my-tasks") {
    return <UserTasksCoordinator onBack={handleBack} />;
  }

  if (state.currentView === "disclosure-topics") {
    return <DisclosureTopics onBack={handleBack} />;
  }

  if (state.currentView.startsWith("ghg-")) {
    const ghgForms = [
      "stationary-sources",
      "mobile-sources",
      "process-emissions",
      "fugitive-emissions",
      "location-based",
      "market-based",
      "upstream-emissions",
      "downstream-emissions",
    ];

    const currentForm = ghgForms.find((form) => state.currentView === `ghg-${form}`);

    if (currentForm) {
      return (
        <DisclosureTopics
          onBack={handleBack}
          initialView="ghg"
          initialForm={currentForm as any}
          initialStep={state.targetStep as any}
        />
      );
    }

    // Handle legacy or combined strings if any (e.g. ghg-stationary-sources-electricity)
    const withoutPrefix = state.currentView.substring(4);
    let form = "";
    let step = "";

    for (const pattern of ghgForms) {
      if (withoutPrefix.startsWith(pattern + "-")) {
        form = pattern;
        step = withoutPrefix.substring(pattern.length + 1);
        break;
      }
    }

    if (form) {
      return (
        <DisclosureTopics
          onBack={handleBack}
          initialView="ghg"
          initialForm={form as any}
          initialStep={step}
        />
      );
    }
  }

  // NEW: Handle activity-metrics view
  if (state.currentView === "activity-metrics") {
    return (
      <DisclosureTopics
        onBack={handleBack}
        initialView="activity-metrics"
        initialStep={state.targetStep as any}
      />
    );
  }

  // Handle all non-GHG disclosure topic views (social, human capital, business model, leadership, etc.)
  const disclosureTopicViews = [
    "biodiversity",
    "crs",
    "security-human-rights",
    "air-quality",
    "water-and-wastewater-management",
    "workforce-health-and-safety",
    "reserves-valuation-capital-expenditures",
    "business-ethics-transparency",
    "critical-incident-risk-management",
    "management-of-legal-and-regulatory-environment",
  ];

  if (disclosureTopicViews.includes(state.currentView)) {
    return (
      <DisclosureTopics
        onBack={handleBack}
        initialView={state.currentView}
        initialForm={state.targetStep as any}
      />
    );
  }

  const isFormValid =
    state.assessmentData.startMonth &&
    state.assessmentData.startYear &&
    state.assessmentData.endMonth &&
    state.assessmentData.endYear &&
    !dateError;

  return (
    <div className="flex h-screen bg-green-50 overflow-hidden">
      <motion.main
        className="flex-1 h-full overflow-y-auto p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.5,
        }}
      >
        <Header />
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Start a New Assessment</h1>
          <p className="text-base text-muted-foreground">
            Start a new assessment to capture your company&apos;s ESG and GHG data, track
            performance, and generate complaince-ready reports.
          </p>
        </div>

        <Button
          className="mb-3 text-sm flex gap-1 text-gray-800 shadow rounded px-4 py-2 w-fit bg-white hover:bg-gray-100 cursor-pointer"
          onClick={backToNewAssessment}
        >
          <ArrowLeft size={18} /> <span className="text-sm">Back</span>
        </Button>

        <Card className="bg-white p-8 space-y-8 shadow-md border-none">
          <CardContent className="space-y-6 p-0">
            {subsidiaries.length > 0 && (
              <div className="space-y-2">
                <label className="text-lg font-semibold text-foreground">Select Subsidiary</label>
                <Select
                  value={state.assessmentData.subsidiary}
                  onValueChange={(value) => handleInputChange("subsidiary", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="mt-3 w-full hover:cursor-pointer border border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
                    <SelectValue
                      placeholder={
                        isLoading
                          ? "Loading..."
                          : `Choose a subsidiary or leave empty for ${user?.company?.name || "company"} assessment`
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {error && (
                      <div className="px-3 py-2 text-red-500 text-sm">
                        Failed to load subsidiaries
                      </div>
                    )}
                    {subsidiaries.map((subsidiary) => (
                      <SelectItem key={subsidiary.id} value={subsidiary.name}>
                        {subsidiary.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Reporting Period */}
            <div className="space-y-4">
              <div>
                <span className="block text-lg font-semibold text-foreground mb-2">
                  Reporting Period
                </span>

                <div className="flex flex-col gap-4">
                  {/* Starting Period */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-foreground w-28">Starting Period</label>
                    <Select
                      value={state.assessmentData.startMonth}
                      onValueChange={(value) => handleInputChange("startMonth", value)}
                    >
                      <SelectTrigger className="w-32 border border-slate-300 hover:cursor-pointer focus:ring-2 focus:ring-green-500">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 overflow-y-auto">
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={state.assessmentData.startYear}
                      onValueChange={(value) => handleInputChange("startYear", value)}
                    >
                      <SelectTrigger className="w-24 border border-slate-300 hover:cursor-pointer focus:ring-2 focus:ring-green-500">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ending Period */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-foreground w-28">Ending Period</label>

                      <Select
                        value={state.assessmentData.endMonth}
                        onValueChange={(value) => handleInputChange("endMonth", value)}
                      >
                        <SelectTrigger
                          className={`w-32 border ${
                            dateError ? "border-red-500" : "border-slate-300"
                          } hover:cursor-pointer focus:ring-2 ${
                            dateError ? "focus:ring-red-500" : "focus:ring-green-500"
                          }`}
                        >
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48 overflow-y-auto">
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={state.assessmentData.endYear}
                        onValueChange={(value) => handleInputChange("endYear", value)}
                      >
                        <SelectTrigger
                          className={`w-24 border ${
                            dateError ? "border-red-500" : "border-slate-300"
                          } hover:cursor-pointer focus:ring-2 ${
                            dateError ? "focus:ring-red-500" : "focus:ring-green-500"
                          }`}
                        >
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {dateError && <p className="text-red-600 text-sm ml-28">{dateError}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-white border border-teal-500 mr-2 hover:scale-[1.02] text-neutral-1000 max-w-[120px] w-full h-8 px-3 text-sm rounded-sm mt-2"
                  onClick={backToNewAssessment}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary transform hover:scale-[1.02] text-white max-w-[120px] w-full h-8 px-3 text-sm rounded-sm mt-2"
                  disabled={!isFormValid}
                  onClick={handleProceed}
                >
                  Proceed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
