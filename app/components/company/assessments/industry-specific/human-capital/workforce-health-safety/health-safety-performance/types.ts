import { FileOrLinkData } from "@/app/components/ui/reusables/AddMoreFilesLinks";

export interface EmployeeFormData {
  totalHoursWorked: string;
  recordableIncidents: string;
  fatalities: string;
  nearMisses: string;
  safetyTrainingHours: string;

  totalHoursWorkedUnit: string;
  recordableIncidentsUnit: string;
  fatalitiesUnit: string;
  nearMissesUnit: string;
  safetyTrainingHoursUnit: string;

  filesAndLinks: FileOrLinkData[];
}

export const defaultEmployeeFormData: EmployeeFormData = {
  totalHoursWorked: "",
  recordableIncidents: "",
  fatalities: "",
  nearMisses: "",
  safetyTrainingHours: "",

  totalHoursWorkedUnit: "Hours",
  recordableIncidentsUnit: "Incidents",
  fatalitiesUnit: "Fatalities",
  nearMissesUnit: "Near Misses",
  safetyTrainingHoursUnit: "Hours",

  filesAndLinks: [],
};
