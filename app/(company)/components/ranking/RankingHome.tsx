"use client";

import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import React, { useState } from "react";
import PerformanceOverview from "./PerformanceOverview";
import ESGLeaderboard from "./RankingTable";

export default function RankingHome() {
  const [target, setTarget] = useState<"target" | "leaderboard">("target");

  const switchState = (nxt: "target" | "leaderboard") => {
    setTarget(nxt);
  };

  return (
    <div className="w-full grid gap-2 lg:gap-4">
      <div className="flex flex-wrap mx-auto items-center max-w-2xl p-3 gap-4 bg-white rounded-sm shadow-md">
        <CustomButton
          variant={target === "target" ? "filled" : "outlined"}
          onClick={() => switchState("target")}
        >
          Targets and Performance
        </CustomButton>
        <CustomButton
          variant={target === "leaderboard" ? "filled" : "outlined"}
          onClick={() => switchState("leaderboard")}
        >
          Leader boards
        </CustomButton>
      </div>

      {target === "target" ? <PerformanceOverview /> : <ESGLeaderboard />}
    </div>
  );
}
