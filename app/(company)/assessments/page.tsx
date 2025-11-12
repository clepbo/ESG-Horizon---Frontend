import { redirect } from "next/navigation";

export default function RedirectToAssessment() {
  redirect("/assessments/new-assessment");
}
