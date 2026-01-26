import { Card, CardTitle } from "@/app/components/ui/card";
import React from "react";
import { RxDividerVertical } from "react-icons/rx";
import { IoMdAlert } from "react-icons/io";

export default function CriticalIncidentRiskManagement() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-lg shadow-sm border-0 grid gap-3">
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
            <p className="text-red-600 text-center font-semibold"> 2 </p>
          </span>
          <span>
            <RxDividerVertical className="" />
          </span>
          <span className="fflex flex-col items-center">
            <p className="text-center"> Total Hours Worked </p>
            <p className="text-green-600 text-center font-semibold"> 2 </p>
          </span>
        </div>
        <Card className="p-4 m-4 bg-[#fff9eb] border border-[#fdeabb] text-[#e69d5d]">
          <div className="flex items-center gap-2">
            <IoMdAlert className="text-lg" />
            <p className="text-xs">
              <span className="font-semibold"> Rate: </span> 0.16 per 200k hours, investigations
              closed for all events.
            </p>
          </div>
        </Card>
      </Card>
      <Card className="rounded-lg shadow-sm border-0 grid gap-3">
        <span className="flex flex-col gap-2">
          <h3 className="p-4 text-lg font-semibold text-gray-900">Catatrophic Risk Management</h3>
          <hr className="text-gray-300" />
        </span>
        <div className=" items-center flex p-4 justify-between">
          <span className="font-semibold">Last Asset Intergrity Audit</span>
          <span>2024-11-15</span>
        </div>
        <Card className="p-4 m-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {" "}
            System Description{" "}
          </CardTitle>
          {/* <CardContent> */}
          <p className="text-sm">
            Comprehensive asset integrity management program in place, independent external audits
            conducted every 3 years for all major facilities. Realtime monitoring of critical
            process parameters.
          </p>
          {/* </CardContent> */}
        </Card>
      </Card>
    </div>
  );
}
