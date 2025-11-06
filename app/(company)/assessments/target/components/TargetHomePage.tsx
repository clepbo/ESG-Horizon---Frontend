"use client"

import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { Edit } from "lucide-react";
import React from "react";
import { TargetSetting } from "./TargetSetting";

export default function TargetHomePage() {
  return (
    <section className="grid gap-4 lg:gap-8 py-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col ">
          <h6 className=""> Set reduction target</h6>
          <small className=""> Define your ESG goals and monitor progress.</small>
        </div>
        <CustomButton icon={<Edit />}> Edit Target </CustomButton>
      </div>
      {/* <InitialTargetPage /> */}
      <TargetSetting />
    </section>
  );
}
