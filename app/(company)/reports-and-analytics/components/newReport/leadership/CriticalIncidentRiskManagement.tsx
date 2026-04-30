import { Card, CardTitle } from "@/app/components/ui/card";
import React from "react";
import { RxDividerVertical } from "react-icons/rx";
import { IoMdAlert } from "react-icons/io";
import { LeadershipAndGovernancePillar } from "@/types/report/reportResponse";
import { formatNumberShort } from "@/lib/numberFormat";

interface CriticalIncidentRiskManagementProps {
  leadershipData?: LeadershipAndGovernancePillar;
}

export default function CriticalIncidentRiskManagement({
  leadershipData,
}: CriticalIncidentRiskManagementProps) {
  const criticalData = leadershipData?.criticalIncidenceRiskManagement;
  const processSafety = criticalData?.processSafetyEvents;
  const catastrophic = criticalData?.catastrophicEvents;

  const tierOneEvents = processSafety?.tierOneEvents ?? 0;
  const totalHoursWorked = processSafety?.totalHoursWorked ?? 0;
  const rate = processSafety?.rate ?? 0;

  const lastAudit = catastrophic?.lastAssetIntegrityAudit || "Not available";
  const systemDescription =
    catastrophic?.description || "No catastrophic risk management system description available.";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-lg shadow-sm border-0 grid gap-3 overflow-hidden">
        <span className="flex flex-col gap-2">
          <h3 className="p-4 text-lg font-semibold text-gray-900">
            {" "}
            Process Safety Events (Tier 1){" "}
          </h3>
          <hr className="text-gray-300" />
        </span>
        <div className=" items-center flex p-4 justify-between">
          <span className="fflex flex-col items-center">
            <p className="text-center"> Tier 1 Events</p>
            <p className="text-red-600 text-center font-semibold">
              {" "}
              {formatNumberShort(tierOneEvents, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
            </p>
          </span>
          <span>
            <RxDividerVertical className="" />
          </span>
          <span className="fflex flex-col items-center">
            <p className="text-center"> Total Hours Worked </p>
            <p className="text-green-600 text-center font-semibold">
              {" "}
              {formatNumberShort(totalHoursWorked, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
            </p>
          </span>
        </div>
        <Card className="p-4 m-4 bg-blue-50 border border-blue-200 text-blue-600">
          <div className="flex items-center gap-2">
            <IoMdAlert className="text-lg" />
            <p className="text-xs">
              <span className="font-semibold">Rate: </span>{" "}
              {formatNumberShort(rate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per
              200k hours, investigations closed for all events.
            </p>
          </div>
        </Card>
      </Card>
      <Card className="rounded-lg shadow-sm border-0 grid gap-3 overflow-hidden">
        <span className="flex flex-col gap-2">
          <h3 className="p-4 text-lg font-semibold text-gray-900">Catastrophic Risk Management</h3>
          <hr className="text-gray-300" />
        </span>
        <div className=" items-center flex p-4 justify-between">
          <span className="font-semibold">Last Asset Integrity Audit</span>
          <span>{lastAudit}</span>
        </div>
        <Card className="p-4 m-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {" "}
            System Description{" "}
          </CardTitle>
          <p className="text-sm mt-2 break-words">{systemDescription}</p>
        </Card>
      </Card>
    </div>
  );
}
