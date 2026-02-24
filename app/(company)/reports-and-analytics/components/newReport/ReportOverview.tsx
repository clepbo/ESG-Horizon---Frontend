import React from "react";
import { CiWavePulse1 } from "react-icons/ci";
import OilRenderCard from "./overview/OilRenderCard";
import ProductionVolumesChart from "./overview/oilProductionChart";
import DonutChart from "./overview/DonoghtChart";
import { FaArrowDown, FaLeaf, FaSeedling } from "react-icons/fa";
import EsgAssignmrntReportCard from "./overview/EsgAssignmrntReportCard";
import { PiUsersFill } from "react-icons/pi";
import { GiHumanPyramid } from "react-icons/gi";
import { formatNumberWithCommas } from "../utils/helpers";
import { formatNumberFull } from "@/lib/numberFormat";
import { ReportResponse } from "@/types/report/reportResponse";

interface ReportOverviewProps {
  reportData?: ReportResponse;
}

export default function ReportOverview({ reportData }: ReportOverviewProps) {
  const activityMetrics = reportData?.activityMetrics;
  const environmental = reportData?.environmental;
  const socialCapital = reportData?.socialCapital;
  const humanCapital = reportData?.humanCapital;
  const businessModel = reportData?.businessModel;
  const leadership = reportData?.leadershipAndGovernance;

  const productionCards = [
    {
      title: "Crude Oil",
      amount: activityMetrics?.productionData?.oilProduction?.crudeOil ?? 0,
      sub: "kbbl/day",
      borderColor: "#EF4444",
    },
    {
      title: "Synthetic Oil",
      amount: activityMetrics?.productionData?.oilProduction?.syntheticOil ?? 0,
      sub: "kbbl/day",
      borderColor: "#FCA5A5",
    },
    {
      title: "Natural Gas",
      amount: activityMetrics?.productionData?.gasProduction?.naturalGas ?? 0,
      sub: "mmscfd",
      borderColor: "#3B82F6",
    },
    {
      title: "Synthetic Gas",
      amount: activityMetrics?.productionData?.gasProduction?.syntheticGas ?? 0,
      sub: "mmscfd",
      borderColor: "#BFD7FE",
    },
  ];

  const offshoreSitesData = [
    {
      name: "Production Platforms",
      value: activityMetrics?.assetPortfolio?.offshoreSites?.productionPlatforms ?? 0,
      color: "#3b82f6",
    },
    {
      name: "FPSOs",
      value: activityMetrics?.assetPortfolio?.offshoreSites?.FPSOs ?? 0,
      color: "#22c55e",
    },
    {
      name: "Other Offshore Sites",
      value: activityMetrics?.assetPortfolio?.offshoreSites?.otherSites ?? 0,
      color: "#9ca3af",
    },
  ];

  const terrestrialSitesData = [
    {
      name: "Flow Stations",
      value: activityMetrics?.assetPortfolio?.terrestrialSites?.flowStations ?? 0,
      color: "#f64c4c",
    },
    {
      name: "Gas Processing Plants",
      value: activityMetrics?.assetPortfolio?.terrestrialSites?.gasProcessingPlants ?? 0,
      color: "#af57db",
    },
    {
      name: "Other Sites",
      value: activityMetrics?.assetPortfolio?.terrestrialSites?.otherSites ?? 0,
      color: "#14b8a6",
    },
  ];

  const oilChartData = [
    {
      name: "Oil Production",
      primary: activityMetrics?.productionData?.oilProduction?.crudeOil ?? 0,
      secondary: activityMetrics?.productionData?.oilProduction?.syntheticOil ?? 0,
      primaryLabel: "Crude Oil",
      secondaryLabel: "Synthetic Oil",
      fillPrimary: "#EF4444",
      fillSecondary: "#FCA5A5",
    },
  ];

  const gasChartData = [
    {
      name: "Gas Production",
      primary: activityMetrics?.productionData?.gasProduction?.naturalGas ?? 0,
      secondary: activityMetrics?.productionData?.gasProduction?.syntheticGas ?? 0,
      primaryLabel: "Natural Gas",
      secondaryLabel: "Synthetic Gas",
      fillPrimary: "#3b82f6",
      fillSecondary: "#bfdbfe",
    },
  ];

  const oilLegendItems = [
    { value: "Crude Oil", color: "#EF4444" },
    { value: "Synthetic Oil", color: "#FCA5A5" },
  ];

  const gasLegendItems = [
    { value: "Natural Gas", color: "#3b82f6" },
    { value: "Synthetic Gas", color: "#bfdbfe" },
  ];

  const environmentalAmount = (
    <p className="font-bold">
      {formatNumberWithCommas(environmental?.total_emission ?? 0)}{" "}
      <sub className="text-xs font-normal text-gray-400"> tCO2e</sub>
    </p>
  );

  const environmentalScore = (
    <small className="flex items-center gap-2">
      <FaArrowDown
        className={`${environmental?.changePercentage && environmental.changePercentage > 0 ? "rotate-180 text-red-500" : "text-green-500"}`}
      />
      {formatNumberFull(Math.abs(environmental?.changePercentage ?? 0), {
        maximumFractionDigits: 1,
      })}
      %
    </small>
  );

  const socialCapitalScore = socialCapital?.operationalDelaysLevel ?? "N/A";

  const humanCapitalScore = (
    <small className="flex items-center gap-2">
      <FaArrowDown
        className={`${humanCapital?.changePercentage && humanCapital.changePercentage > 0 ? "rotate-180 text-red-500" : "text-green-500"}`}
      />
      {formatNumberFull(Math.abs(humanCapital?.changePercentage ?? 0), {
        maximumFractionDigits: 1,
      })}
      %
    </small>
  );

  const businessModelScore = (
    <small className="flex items-center gap-2">
      <FaArrowDown
        className={`${businessModel?.changePercentage && businessModel.changePercentage > 0 ? "rotate-180 text-red-500" : "text-green-500"}`}
      />
      {formatNumberFull(Math.abs(businessModel?.changePercentage ?? 0), {
        maximumFractionDigits: 1,
      })}
      %
    </small>
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-10">
      <div className="flex items-center gap-2">
        <span className="p-2 bg-[#CDFAF3]">
          <CiWavePulse1 className="text-primary rounded" />
        </span>
        <div className="flex flex-col">
          <h6 className="text-sm"> Activity metrics</h6>
          <p className="text-xs text-gray-600">Production Data and Asset Portfolio</p>
        </div>
      </div>

      <div className="">
        <h5 className=" border-b w-full border-gray-400 text-gray-700">Production Data</h5>
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-3 mt-3">
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProductionVolumesChart
              data={oilChartData}
              title="Oil Production"
              legendItems={oilLegendItems}
            />
            <ProductionVolumesChart
              data={gasChartData}
              title="Gas Production"
              legendItems={gasLegendItems}
            />
          </div>
          <div className="flex flex-col gap-2 lg:gap-4">
            {productionCards.map((card) => {
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
              amount={activityMetrics?.assetPortfolio?.offshoreSites?.totalNumber ?? 0}
            />
          </span>
          <span className="max-w-sm">
            <OilRenderCard
              borderColor={"#0000"}
              title={"Total Number of Terrestrial Sites"}
              sub={"sites"}
              amount={activityMetrics?.assetPortfolio?.terrestrialSites?.totalNumber ?? 0}
            />
          </span>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
        <span className="col-span-1">
          <DonutChart data={offshoreSitesData} />
        </span>
        <span className="col-span-1">
          <DonutChart title="Terrestrial Sites" data={terrestrialSitesData} />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="p-2 bg-gray-300">
          <FaSeedling className="text-gray-600 rounded" />
        </span>
        <div className="flex flex-col">
          <h6 className="text-sm"> ESG Assessment Report </h6>
          <p className="text-xs text-gray-600">
            {" "}
            Environmental, Social Capital, Human Capital, Business Model, and Leadership &
            Governance{" "}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <EsgAssignmrntReportCard
          title={"Total Emissions"}
          pillar={"Environmental"}
          score={environmentalScore}
          amount={environmentalAmount}
          footer={
            "On track to meet 2030 reduction targets. Scope 2 emissions show significant improvement."
          }
          icon={<FaLeaf />}
          iconBg={"#f1fcf4"}
          iconText={"#1e8a3d"}
          borderColor={"#1e8a3d"}
          scoreBg="#e5f5ec"
          scoreColor="#93c4a1"
        />
        <EsgAssignmrntReportCard
          title={"Operational Delays"}
          pillar={"Social Capital"}
          score={socialCapitalScore}
          amount={`${socialCapital?.totalNumberOfIncidents ?? 0} incidents`}
          footer={
            "Community engagement efforts increased in conflict zones. Protests remain a key operational risk."
          }
          icon={<PiUsersFill />}
          iconBg={"#eff5ff"}
          iconText={"#2570eb"}
          borderColor={"#2570eb"}
          scoreColor="#93BBFD"
        />
        <EsgAssignmrntReportCard
          title={"Total recordable incident rate"}
          pillar={"Human Capital"}
          score={humanCapitalScore}
          amount={`${humanCapital?.totalRecordableIncidentRatePer200kHours ?? 0} per 200k hrs`}
          footer={
            "Safety performance improved by 10% YoY. Zero fatalities recorded in the reporting period."
          }
          icon={<GiHumanPyramid />}
          iconBg={"#ECFDF5"}
          iconText={"#0D9488"}
          borderColor={"#0D9488"}
          scoreColor="#5EEAD4"
        />
        <EsgAssignmrntReportCard
          title={"Reserves at risk"}
          pillar={"Business Model"}
          score={businessModelScore}
          amount={`${businessModel?.totalReservesAmountAtRisk ?? 0} bbl`}
          footer={
            "Strategic shift towards renewables accelerating. Carbon pricing impact on reserves modeled"
          }
          icon={<GiHumanPyramid />}
          iconBg={"#f5e2ff"}
          iconText={"#af57db"}
          borderColor={"#af57db"}
          scoreColor="#D8B4FE"
        />
        <EsgAssignmrntReportCard
          title={"Process safety"}
          pillar={"Leadership and Governance"}
          score={`${leadership?.processSafetyPercentage ?? 0}%`}
          amount={leadership?.numberOfTierEventsAndWhatTier ?? "N/A"}
          footer={"Sustainability committee established. Whistleblower system active and verified"}
          icon={<GiHumanPyramid />}
          iconBg={"#e8e8e8"}
          iconText={"#4a4a4a"}
          borderColor={"#4a4a4a"}
          scoreColor="#D1D5DB"
        />
      </div>
    </div>
  );
}
