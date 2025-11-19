import React from "react";
import { Card, CardTitle } from "../../ui/card";
import {
  CustomProgressWithoutUnit,
} from "@/app/(company)/reports-and-analytics/components/charts/ProgressBar";
import { CustomButton } from "../../ui/reusables/CustomButton";
import { ArrowRight } from "lucide-react";


export default function Reportcard() {
  return (
    <Card className="w-full h-64 flex flex-col p-4 gap-2 md:gap-4 justify-center">
      <CardTitle className="text-lg"> Upstream (Exploration & Production)</CardTitle>
      <div className="flex items-center justify-between w-full">
        <p className="text-sm"> January 2021 - June 2021</p>
        <p className=" rounded-2xl text-sm px-1 font-semibold bg-green-500 text-white">
          {" "}
          Completed
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <CustomProgressWithoutUnit value={78} title="Progress" total={78} percent={78} unit="%" />
        {/* <p className='text-sm'> 8 of 8 sections completed</p> */}
      </div>
      <CustomButton
        variant={"outlined"}
        size={"lg"}
        className="w-full rounded p-2"
        icon={<ArrowRight />}
      >
        View Report
      </CustomButton>
    </Card>
  );
}
