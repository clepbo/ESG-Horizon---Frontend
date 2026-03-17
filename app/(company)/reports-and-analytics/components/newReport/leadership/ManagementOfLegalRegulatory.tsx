import { Card } from "@/app/components/ui/card";
import React from "react";
import { VscLaw } from "react-icons/vsc";
import { IoMdCheckboxOutline } from "react-icons/io";
import { LeadershipAndGovernancePillar } from "@/types/report/reportResponse";

interface ManagementOfLegalRegulatoryProps {
  leadershipData?: LeadershipAndGovernancePillar;
}

export default function ManagementOfLegalRegulatory({
  leadershipData,
}: ManagementOfLegalRegulatoryProps) {
  const legalData = leadershipData?.managementOfLegalAndRegulatoryEnvironment;

  const publicPolicyDescription =
    legalData?.publicPolicyAndLobbying || "No public policy disclosure available.";
  const policyPosition = legalData?.policyPosition || "No policy position disclosed.";
  const sustainabilityDescription =
    legalData?.sustainabilityGovernance || "No sustainability governance description available.";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-lg shadow-sm border-0 grid gap-3">
        <span className="flex flex-col gap-2">
          <h3 className="p-4 text-lg font-semibold text-gray-900"> Public Policy & Lobbying </h3>
          <hr className="text-gray-300" />
        </span>
        <div className="bg-[#fafafa] m-4 rounded-md p-4 items-center flex justify-between">
          <span className="flex items-center gap-2">
            <VscLaw className="text-[#4185f6]" />
            Lobbying Disclosure
          </span>
          <span className={`rounded-2xl px-2 py-1 ${legalData?.publicPolicyAndLobbying === "yes" ? "bg-success-200 text-[#388e4e]" : "bg-gray-100 text-gray-700"}`}>
            {legalData?.publicPolicyAndLobbying === "yes" ? "Disclosed" : "Not Disclosed"}
          </span>
        </div>
        <Card className="p-4 m-4">
          <p className="text-sm">
            <span className="font-semibold">Policy Position: </span> {policyPosition}
          </p>
          <p className="text-sm mt-2">{publicPolicyDescription}</p>
        </Card>
      </Card>
      <Card className="rounded-lg shadow-sm border-0 grid gap-3">
        <span className="flex flex-col gap-2">
          <h3 className="p-4 text-lg font-semibold text-gray-900"> Sustainability Governance </h3>
          <hr className="text-gray-300" />
        </span>
        <div className="bg-[#fafafa] m-4 rounded-md p-4 items-center flex justify-between">
          <span className="flex items-center gap-2">
            <IoMdCheckboxOutline className="text-[#b3d7bc]" />
            Board Oversight Committee
          </span>
          <span className={`rounded-2xl px-2 py-1 ${legalData?.hasBoardCommittee === "yes" ? "bg-success-200 text-[#388e4e]" : "bg-gray-100 text-gray-700"}`}>
            {legalData?.hasBoardCommittee === "yes" ? "Established" : "Not Established"}
          </span>
        </div>
        <Card className="p-4 m-4">
          <p className="text-sm">{sustainabilityDescription}</p>
        </Card>
      </Card>
    </div>
  );
}
