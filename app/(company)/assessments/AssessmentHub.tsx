"use client";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { DisclosureTopics } from "@/app/components/company/assessments/DisclosureTopics";
import {
  Assessment,
  AssessmentTable,
} from "@/app/components/company/assessments/AssessmentTable";
import Header from "../components/Header";

const mockAssessments: Assessment[] = [
  {
    id: 1,
    startPeriod: "Jan 2025",
    endPeriod: "Dec 2025",
    subsidiary: "Upstream Operations",
    status: "In Progress",
  },
  {
    id: 2,
    startPeriod: "Jan 2024",
    endPeriod: "Dec 2024",
    subsidiary: "Downstream Operations",
    status: "Completed",
  },
  {
    id: 3,
    startPeriod: "Jul 2025",
    endPeriod: "Dec 2025",
    subsidiary: "Midstream Operations",
    status: "Draft",
  },
  {
    id: 4,
    startPeriod: "Jan 2025",
    endPeriod: "Jun 2025",
    subsidiary: "Refining Division",
    status: "Completed",
  },
  {
    id: 5,
    startPeriod: "Oct 2025",
    endPeriod: "Dec 2025",
    subsidiary: "Marketing Division",
    status: "In Progress",
  },
  {
    id: 6,
    startPeriod: "March 2025",
    endPeriod: "Dec 2025",
    subsidiary: "Marketing Division",
    status: "In Progress",
  },
  {
    id: 5,
    startPeriod: "June 2025",
    endPeriod: "Dec 2025",
    subsidiary: "Marketing Division",
    status: "In Progress",
  },
];

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
const years = ["2025", "2024", "2022", "2021", "2020"];
const subsidiaries = [
  "Upstream Operations",
  "Downstream Operations",
  "Midstream Operations",
  "Refining Division",
  "Marketing Division",
];

export default function AssessmentHub() {
  const { state, dispatch } = useAssessment();

  const handleProceed = () => {
    dispatch({
      type: "UPDATE_BASIC_DATA",
      payload: {
        subsidiary: state.assessmentData.subsidiary,
        startMonth: state.assessmentData.startMonth,
        startYear: state.assessmentData.startYear,
        endMonth: state.assessmentData.endMonth,
        endYear: state.assessmentData.endYear,
      },
    });
    dispatch({ type: "SET_VIEW", payload: "disclosure" });
  };

  const handleBack = () => {
    dispatch({ type: "SET_VIEW", payload: "hub" });
  };

  const handleInputChange = (field: string, value: string) => {
    dispatch({
      type: "UPDATE_BASIC_DATA",
      payload: { [field]: value },
    });
  };

  if (state.currentView === "disclosure") {
    return <DisclosureTopics onBack={handleBack} />;
  }

  const isFormValid =
    state.assessmentData.subsidiary &&
    state.assessmentData.startMonth &&
    state.assessmentData.startYear &&
    state.assessmentData.endMonth &&
    state.assessmentData.endYear;

  return (
    <div className="flex h-screen bg-green-50 overflow-hidden">
      <main className="flex-1 h-full overflow-y-auto p-6">
        <Header />
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Assessment Hub
          </h1>
          <p className="text-base text-muted-foreground">
            Track your ESG data collection progress across all pillars
          </p>
          {state.lastSaved && (
            <div className="flex items-center gap-2 text-green-600 animate-in slide-in-from-left-4 duration-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">
                Last saved: {state.lastSaved.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <Card className="bg-white p-8 space-y-8 shadow-none border-none">
          <CardContent className="space-y-6 p-0">
            <div className="space-y-2">
              <label className="text-lg font-semibold text-foreground">
                Select Subsidiary
              </label>
              <Select
                value={state.assessmentData.subsidiary}
                onValueChange={(value) =>
                  handleInputChange("subsidiary", value)
                }
              >
                <SelectTrigger className="mt-3 w-full hover:cursor-pointer border border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
                  <SelectValue placeholder="Choose a subsidiary" />
                </SelectTrigger>
                <SelectContent>
                  {subsidiaries.map((subsidiary) => (
                    <SelectItem
                      key={subsidiary}
                      value={subsidiary}
                      className="transition-colors hover:bg-accent"
                    >
                      {subsidiary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-lg font-semibold text-foreground mb-2">
                  Reporting Period
                </span>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-foreground w-28">
                      Starting Period
                    </label>
                    <Select
                      value={state.assessmentData.startMonth}
                      onValueChange={(value) =>
                        handleInputChange("startMonth", value)
                      }
                    >
                      <SelectTrigger className="w-32 border border-slate-300 hover:cursor-pointer transition-colors focus:ring-2 focus:ring-green-500">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem
                            key={month}
                            value={month}
                            className="transition-colors hover:bg-accent"
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={state.assessmentData.startYear}
                      onValueChange={(value) =>
                        handleInputChange("startYear", value)
                      }
                    >
                      <SelectTrigger className="w-24 border  hover:cursor-pointer border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem
                            key={year}
                            value={year}
                            className="transition-colors hover:bg-accent"
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-foreground w-28">
                      Ending Period
                    </label>
                    <Select
                      value={state.assessmentData.endMonth}
                      onValueChange={(value) =>
                        handleInputChange("endMonth", value)
                      }
                    >
                      <SelectTrigger className="w-32 hover:cursor-pointer  border border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem
                            key={month}
                            value={month}
                            className="transition-colors hover:bg-accent"
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={state.assessmentData.endYear}
                      onValueChange={(value) =>
                        handleInputChange("endYear", value)
                      }
                    >
                      <SelectTrigger className="w-24 border hover:cursor-pointer border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem
                            key={year}
                            value={year}
                            className="transition-colors hover:bg-accent"
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button
                className="bg-green-600  hover:cursor-pointer hover:bg-green-700 text-white transition-all duration-200 max-w-[120px] w-full h-8 px-3 text-sm rounded-md mt-2"
                disabled={!isFormValid}
                onClick={handleProceed}
              >
                Proceed
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6 mt-10">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Recent Assessments
          </h2>

          <AssessmentTable data={mockAssessments} />
        </div>
      </main>
    </div>
  );
}

// "use client";
// import Header from "../components/Header";
// import { useState } from "react";
// import { Card, CardContent } from "@/app/components/ui/card";
// import { Button } from "@/app/components/ui/button";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/app/components/ui/select";
// import { Badge } from "@/app/components/ui/badge";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/app/components/ui/table";
// import { Trash2, CheckCircle2 } from "lucide-react";
// import { DisclosureTopics } from "@/app/components/company/assessments/DisclosureTopics";
// import { useAssessment } from "@/hooks/useAssessment";
// import SearchInput from "@/app/components/ui/reusables/SearchInput";

// const mockAssessments = [
//     {
//         id: 1,
//         startPeriod: "Jan 2025",
//         endPeriod: "Dec 2025",
//         subsidiary: "Upstream Operations",
//         status: "In Progress",
//     },
//     {
//         id: 2,
//         startPeriod: "Jan 2024",
//         endPeriod: "Dec 2024",
//         status: "Completed",
//         subsidiary: "Downstream Operations",
//     },
//     {
//         id: 3,
//         startPeriod: "Jul 2025",
//         endPeriod: "Dec 2025",
//         subsidiary: "Midstream Operations",
//         status: "Draft",
//     },
//     {
//         id: 4,
//         startPeriod: "Jan 2025",
//         endPeriod: "Jun 2025",
//         subsidiary: "Refining Division",
//         status: "Completed",
//     },
//     {
//         id: 5,
//         startPeriod: "Oct 2025",
//         endPeriod: "Dec 2025",
//         subsidiary: "Marketing Division",
//         status: "In Progress",
//     },
// ];

// const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
// ];

// const years = ["2025", "2024", "2022", "2021", "2020"];

// const subsidiaries = [
//     "Upstream Operations",
//     "Downstream Operations",
//     "Midstream Operations",
//     "Refining Division",
//     "Marketing Division",
// ];

// export default function AssessmentHub() {
//     const { state, dispatch } = useAssessment();
//     const [searchTerm, setSearchTerm] = useState("");
//     const [statusFilter, setStatusFilter] = useState("");
//     const [dateFilter, setDateFilter] = useState("");

//     const getStatusBadgeVariant = (status: string) => {
//         switch (status) {
//             case "Completed":
//                 return "default";
//             case "In Progress":
//                 return "secondary";
//             case "Draft":
//                 return "outline";
//             default:
//                 return "outline";
//         }
//     };

//     const filteredAssessments = mockAssessments.filter((assessment) => {
//         const matchesSearch = assessment.subsidiary
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase());
//         const matchesStatus =
//             !statusFilter || assessment.status === statusFilter;
//         return matchesSearch && matchesStatus;
//     });

//     const handleProceed = () => {
//         dispatch({
//             type: "UPDATE_BASIC_DATA",
//             payload: {
//                 subsidiary: state.assessmentData.subsidiary,
//                 startMonth: state.assessmentData.startMonth,
//                 startYear: state.assessmentData.startYear,
//                 endMonth: state.assessmentData.endMonth,
//                 endYear: state.assessmentData.endYear,
//             },
//         });
//         dispatch({ type: "SET_VIEW", payload: "disclosure" });
//     };

//     const handleBack = () => {
//         dispatch({ type: "SET_VIEW", payload: "hub" });
//     };

//     const handleInputChange = (field: string, value: string) => {
//         dispatch({
//             type: "UPDATE_BASIC_DATA",
//             payload: { [field]: value },
//         });
//     };

//     if (state.currentView === "disclosure") {
//         return <DisclosureTopics onBack={handleBack} />;
//     }

//     const isFormValid =
//         state.assessmentData.subsidiary &&
//         state.assessmentData.startMonth &&
//         state.assessmentData.startYear &&
//         state.assessmentData.endMonth &&
//         state.assessmentData.endYear;

//     return (
//         <div className="flex h-screen bg-green-50 overflow-hidden">
//             <main className="flex-1 h-full overflow-y-auto p-6">
//                 <Header />

//                 <div className="space-y-1 mb-6">
//                     <h1 className="text-2xl font-semibold text-foreground">
//                         Assessment Hub
//                     </h1>
//                     <p className="text-base text-muted-foreground">
//                         Track your ESG data collection progress across all
//                         pillars
//                     </p>
//                     {state.lastSaved && (
//                         <div className="flex items-center gap-2 text-green-600 animate-in slide-in-from-left-4 duration-500">
//                             <CheckCircle2 className="h-4 w-4" />
//                             <span className="text-sm">
//                                 Last saved: {state.lastSaved.toLocaleString()}
//                             </span>
//                         </div>
//                     )}
//                 </div>

//                 <Card className="bg-white p-8 space-y-8 shadow-none border-none">
//                     <CardContent className="space-y-6 p-0">
//                         <div className="space-y-2">
//                             <label className="text-lg font-semibold text-foreground">
//                                 Select Subsidiary
//                             </label>
//                             <Select
//                                 value={state.assessmentData.subsidiary}
//                                 onValueChange={(value) =>
//                                     handleInputChange("subsidiary", value)
//                                 }
//                             >
//                                 <SelectTrigger className="mt-3 w-full hover:cursor-pointer border border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
//                                     <SelectValue placeholder="Choose a subsidiary" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {subsidiaries.map((subsidiary) => (
//                                         <SelectItem
//                                             key={subsidiary}
//                                             value={subsidiary}
//                                             className="transition-colors hover:bg-accent"
//                                         >
//                                             {subsidiary}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         </div>

//                         <div className="space-y-4">
//                             <div>
//                                 <span className="block text-lg font-semibold text-foreground mb-2">
//                                     Reporting Period
//                                 </span>
//                                 <div className="flex flex-col gap-4">
//                                     <div className="flex items-center gap-2">
//                                         <label className="text-sm text-foreground w-28">
//                                             Starting Period
//                                         </label>
//                                         <Select
//                                             value={
//                                                 state.assessmentData.startMonth
//                                             }
//                                             onValueChange={(value) =>
//                                                 handleInputChange(
//                                                     "startMonth",
//                                                     value
//                                                 )
//                                             }
//                                         >
//                                             <SelectTrigger className="w-32 border border-slate-300 hover:cursor-pointer transition-colors focus:ring-2 focus:ring-green-500">
//                                                 <SelectValue placeholder="Month" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {months.map((month) => (
//                                                     <SelectItem
//                                                         key={month}
//                                                         value={month}
//                                                         className="transition-colors hover:bg-accent"
//                                                     >
//                                                         {month}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         <Select
//                                             value={
//                                                 state.assessmentData.startYear
//                                             }
//                                             onValueChange={(value) =>
//                                                 handleInputChange(
//                                                     "startYear",
//                                                     value
//                                                 )
//                                             }
//                                         >
//                                             <SelectTrigger className="w-24 border  hover:cursor-pointer border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
//                                                 <SelectValue placeholder="Year" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {years.map((year) => (
//                                                     <SelectItem
//                                                         key={year}
//                                                         value={year}
//                                                         className="transition-colors hover:bg-accent"
//                                                     >
//                                                         {year}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <label className="text-sm text-foreground w-28">
//                                             Ending Period
//                                         </label>
//                                         <Select
//                                             value={
//                                                 state.assessmentData.endMonth
//                                             }
//                                             onValueChange={(value) =>
//                                                 handleInputChange(
//                                                     "endMonth",
//                                                     value
//                                                 )
//                                             }
//                                         >
//                                             <SelectTrigger className="w-32 hover:cursor-pointer  border border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
//                                                 <SelectValue placeholder="Month" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {months.map((month) => (
//                                                     <SelectItem
//                                                         key={month}
//                                                         value={month}
//                                                         className="transition-colors hover:bg-accent"
//                                                     >
//                                                         {month}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         <Select
//                                             value={state.assessmentData.endYear}
//                                             onValueChange={(value) =>
//                                                 handleInputChange(
//                                                     "endYear",
//                                                     value
//                                                 )
//                                             }
//                                         >
//                                             <SelectTrigger className="w-24 border hover:cursor-pointer border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
//                                                 <SelectValue placeholder="Year" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {years.map((year) => (
//                                                     <SelectItem
//                                                         key={year}
//                                                         value={year}
//                                                         className="transition-colors hover:bg-accent"
//                                                     >
//                                                         {year}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                     </div>
//                                 </div>
//                             </div>
//                             <Button
//                                 className="bg-green-600  hover:cursor-pointer hover:bg-green-700 text-white transition-all duration-200 max-w-[120px] w-full h-8 px-3 text-sm rounded-md mt-2"
//                                 disabled={!isFormValid}
//                                 onClick={handleProceed}
//                             >
//                                 Proceed
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <div className="space-y-6 mt-10">
//                     <h2 className="text-lg font-semibold text-foreground mb-2">
//                         Recent Assessments
//                     </h2>

//                     <Card className="bg-white p-8 space-y-6 shadow-none border-none">
//                         <CardContent className="space-y-6 p-0">
//                             {/* Filters */}
//                             <div className="flex gap-4 items-center mb-2">
//                                 <SearchInput
//                                     placeholder="Search..."
//                                     value={searchTerm}
//                                     onChange={(e) =>
//                                         setSearchTerm(e.target.value)
//                                     }
//                                 />

//                                 <Select
//                                     value={statusFilter}
//                                     onValueChange={setStatusFilter}
//                                 >
//                                     <SelectTrigger className="w-40 border border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
//                                         <SelectValue placeholder="Status" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">
//                                             All Status
//                                         </SelectItem>
//                                         <SelectItem value="Completed">
//                                             Completed
//                                         </SelectItem>
//                                         <SelectItem value="In Progress">
//                                             In Progress
//                                         </SelectItem>
//                                         <SelectItem value="Draft">
//                                             Draft
//                                         </SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                                 <Select
//                                     value={dateFilter}
//                                     onValueChange={setDateFilter}
//                                 >
//                                     <SelectTrigger className="w-40 border border-slate-300 transition-colors focus:ring-2 focus:ring-green-500">
//                                         <SelectValue placeholder="Date" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="all">
//                                             All Dates
//                                         </SelectItem>
//                                         <SelectItem value="2025">
//                                             2025
//                                         </SelectItem>
//                                         <SelectItem value="2024">
//                                             2024
//                                         </SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             <div className="overflow-hidden">
//                                 <Table className="w-full">
//                                     <TableHeader>
//                                         <TableRow className="border-b border-gray-300">
//                                             <TableHead className="py-3 px-4 text-gray-900 font-semibold">
//                                                 Starting Period
//                                             </TableHead>
//                                             <TableHead className="py-3 px-4 text-gray-900 font-semibold">
//                                                 Ending Period
//                                             </TableHead>
//                                             <TableHead className="py-3 px-4 text-gray-900 font-semibold">
//                                                 Subsidiaries
//                                             </TableHead>
//                                             <TableHead className="py-3 px-4 text-gray-900 font-semibold">
//                                                 Status
//                                             </TableHead>
//                                             <TableHead className="py-3 px-4 text-gray-900 font-semibold">
//                                                 Quick Actions
//                                             </TableHead>
//                                         </TableRow>
//                                     </TableHeader>

//                                     <TableBody>
//                                         {filteredAssessments.map(
//                                             (assessment, idx) => (
//                                                 <TableRow
//                                                     key={assessment.id}
//                                                     className={
//                                                         idx !==
//                                                         filteredAssessments.length -
//                                                             1
//                                                             ? "border-b border-gray-300"
//                                                             : ""
//                                                     }
//                                                 >
//                                                     <TableCell className="py-3 px-4">
//                                                         {assessment.startPeriod}
//                                                     </TableCell>
//                                                     <TableCell className="py-3 px-4">
//                                                         {assessment.endPeriod}
//                                                     </TableCell>
//                                                     <TableCell className="py-3 px-4">
//                                                         {assessment.subsidiary}
//                                                     </TableCell>
//                                                     <TableCell className="py-3 px-4">
//                                                         <Badge
//                                                             variant={getStatusBadgeVariant(
//                                                                 assessment.status
//                                                             )}
//                                                             className="transition-colors"
//                                                         >
//                                                             {assessment.status}
//                                                         </Badge>
//                                                     </TableCell>
//                                                     <TableCell className="py-3 px-4">
//                                                         <div className="flex gap-2">
//                                                             {assessment.status ===
//                                                             "Draft" ? (
//                                                                 <Button
//                                                                     size="sm"
//                                                                     className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 h-8 px-3 text-sm rounded-sm"
//                                                                 >
//                                                                     Edit
//                                                                 </Button>
//                                                             ) : (
//                                                                 <Button
//                                                                     size="sm"
//                                                                     className="bg-green-600 hover:bg-green-500 text-white transition-all duration-200 h-8 px-3 text-sm rounded-sm"
//                                                                 >
//                                                                     Continue
//                                                                 </Button>
//                                                             )}
//                                                             <Button
//                                                                 size="sm"
//                                                                 variant="outline"
//                                                                 className="text-destructive hover:text-destructive bg-transparent transition-all duration-200 h-8 px-2 rounded-sm"
//                                                             >
//                                                                 <Trash2 className="h-4 w-4" />
//                                                             </Button>
//                                                         </div>
//                                                     </TableCell>
//                                                 </TableRow>
//                                             )
//                                         )}
//                                     </TableBody>
//                                 </Table>
//                             </div>

//                             <div className="flex items-center justify-center gap-4 pt-4">
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-sm text-muted-foreground">
//                                         Rows per page
//                                     </span>
//                                     <Select defaultValue="10">
//                                         <SelectTrigger className="w-16">
//                                             <SelectValue />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             <SelectItem value="5">5</SelectItem>
//                                             <SelectItem value="10">
//                                                 10
//                                             </SelectItem>
//                                             <SelectItem value="20">
//                                                 20
//                                             </SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </div>
//                                 <span className="text-sm text-muted-foreground">
//                                     1-{filteredAssessments.length} of{" "}
//                                     {filteredAssessments.length} showing
//                                 </span>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </main>
//         </div>
//     );
// }
