import React from "react";
import { CiWavePulse1 } from "react-icons/ci";
import OilRenderCard, { cardData } from "./overview/OilRenderCard";
import ProductionVolumesChart from "./overview/oilProductionChart";
import DonutChart from "./overview/DonoghtChart";
import { FaArrowDown, FaLeaf, FaSeedling } from "react-icons/fa";
import EsgAssignmrntReportCard from "./overview/EsgAssignmrntReportCard";
import { PiUsersFill } from "react-icons/pi";
import { GiHumanPyramid } from "react-icons/gi";
import { useSingleReport } from "../service/useReport";
import { useParams } from "next/navigation";

export default function ReportOverview() {

   const params = useParams();
     const { data, isError } = useSingleReport(Number(params?.id));
   console.log("Report Overview Data:", data);
  const environmentalAmount = (
    <h5 className="font-bold">
      154,000 <sub className="text-xs font-normal text-gray-400"> tCO2e</sub>
    </h5>
  );
  const socialAmount = (
    <h5 className="font-bold">
      High Risk<sub className="text-xs font-normal text-gray-400"> in 2 regions</sub>
    </h5>
  );
  const environmentalScore = (
    <small className="flex items-center gap-2">
      <FaArrowDown className={` rotate-180`} />
      23
    </small>
  );
  const humanAmt = (
    <h5 className="font-bold">
      0.45<sub className="text-xs font-normal text-gray-400"> per 200k hrs </sub>
    </h5>
  );
  return (
    <div className="flex flex-col gap-4 lg:gap-10">
      <div className="flex items-center gap-2">
        <span className="p-2 bg-[#CDFAF3]">
          <CiWavePulse1 className="text-primary rounded" />
        </span>
        <div className="flex flex-col">
          <h6 className="text-sm"> Activity metrics</h6>
          <text className="text-xs text-gray-600"> Production Data and Asset Portfolio</text>
        </div>
      </div>

      <div className="">
        <h5 className=" border-b w-full border-gray-400 text-gray-700">Production Data</h5>
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-3 mt-3">
          <div className="col-span-2">
            <ProductionVolumesChart />
          </div>
          <div className="flex flex-col gap-2 lg:gap-4">
            {cardData.map((card) => {
              return (
                <OilRenderCard
                  key={card.title}
                  borderColor={card.borderColor}
                  title={card.title}
                  amount={card.amount}
                  sub={card.sub}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="">
        <h5 className=" border-b w-full border-gray-400 text-gray-700 ">Asset portfolio</h5>
        <div className="grid grid-cols-1 items-start md:grid-cols-2 mt-6">
          <span className="max-w-sm">
            <OilRenderCard
              borderColor={"#0000"}
              title={"Total Number of Offshore Sites"}
              sub={"sites"}
              amount={23}
            />
          </span>
          <span className="max-w-sm">
            <OilRenderCard
              borderColor={"#0000"}
              title={"Total Number of Offshore Sites"}
              sub={"sites"}
              amount={23}
            />
          </span>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
        <span className="col-span-1">
          <DonutChart
            data={[
              { name: "Production Platforms", value: 470, color: "#3b82f6" },
              { name: "FPSOs", value: 120, color: "#22c55e" },
              { name: "Other Offshore Sites", value: 80, color: "#9ca3af" },
            ]}
          />
        </span>
        <span className="col-span-1">
          <DonutChart
            title="Terrestial Sites"
            data={[
              { name: "Flow Stations", value: 470, color: "#f64c4c" },
              { name: "Gas Proseccing Plants", value: 120, color: "#af57db" },
              { name: "Other Sites", value: 80, color: "#9ca3af" },
            ]}
          />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="p-2 bg-gray-300">
          <FaSeedling className="text-gray-600 rounded" />
        </span>
        <div className="flex flex-col">
          <h6 className="text-sm"> ESG Assessment Report </h6>
          <text className="text-xs text-gray-600">
            {" "}
            Environmental, Social Capital, Human Capital, Business Model, and Leadership &
            Governance{" "}
          </text>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <EsgAssignmrntReportCard
          title={"Total Emissions"}
          pillar={"Environmental"}
          score={environmentalScore}
          amount={environmentalAmount}
          footer={
            "On track to meet 2030 reduction targets. Scope 2 emissions showsignificant improvement."
          }
          icon={<FaLeaf />}
          iconBg={"#f1fcf4"}
          iconText={"#1e8a3d"}
          borderColor={"#1e8a3d"}
          scoreBg="#e5f5ec"
          scoreColor="#93c4a1"
        />
        <EsgAssignmrntReportCard
          title={"Operational  Delays"}
          pillar={"Social Capital"}
          score={"15 indidents"}
          amount={socialAmount}
          footer={
            "Community engagement efforts increased in conflict zones. Protest remain a key operational risk."
          }
          icon={<PiUsersFill />}
          iconBg={"#eff5ff"}
          iconText={"#2570eb"}
          borderColor={"#2570eb"}
          scoreColor="#e8ab73"
        />
        <EsgAssignmrntReportCard
          title={"Total recordable incident rate"}
          pillar={"Human Capital"}
          score={environmentalScore}
          amount={humanAmt}
          footer={
            "Safety performance improved by 10% YoY. Zero fatalities recorded in the reporting period."
          }
          icon={<GiHumanPyramid />}
          iconBg={"#fcf8ee"}
          iconText={"#dca54b"}
          borderColor={"#dca54b"}
          scoreColor="#e8ab73"
        />
        <EsgAssignmrntReportCard
          title={"Reserves at risk"}
          pillar={"Business Model"}
          score={environmentalScore}
          amount={humanAmt}
          footer={
            "Strategic shift towards renewables accelerating. Carbon pricing impact on reserves modeled"
          }
          icon={<GiHumanPyramid />}
          iconBg={"#f5e2ff"}
          iconText={"#af57db"}
          borderColor={"#af57db"}
          scoreColor="#e8ab73"
        />
        <EsgAssignmrntReportCard
          title={"Process safety"}
          pillar={"Leadership and Governance"}
          score={environmentalScore}
          amount={humanAmt}
          footer={"Sustainability committee established. Whistleblower system active and verified"}
          icon={<GiHumanPyramid />}
          iconBg={"#e8e8e8"}
          iconText={"#4a4a4a"}
          borderColor={"#4a4a4a"}
          scoreColor="#e8ab73"
        />
      </div>
    </div>
  );
}
