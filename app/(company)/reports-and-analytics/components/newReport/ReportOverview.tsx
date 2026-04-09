import React from "react";
import { CiWavePulse1 } from "react-icons/ci";
import OilRenderCard from "./overview/OilRenderCard";
import ProductionVolumesChart from "./overview/oilProductionChart";
import DonutChart from "./overview/DonoghtChart";
import { FaArrowDown, FaLeaf, FaSeedling } from "react-icons/fa";
import EsgAssignmrntReportCard from "./overview/EsgAssignmrntReportCard";
import { PiUsersFill } from "react-icons/pi";
import { GiHumanPyramid } from "react-icons/gi";
import { formatNumberFull, formatNumberShort } from "@/lib/numberFormat";
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
      {formatNumberShort(environmental?.total_emission ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
      <sub className="text-xs font-normal text-gray-600"> tCO2e</sub>
    </p>
  );

  const environmentalScore = environmental?.changePercentage != null ? (
    <small className="flex items-center gap-2">
      <FaArrowDown
        className={`${environmental.changePercentage > 0 ? "rotate-180 text-red-500" : "text-green-500"}`}
      />
      {formatNumberFull(Math.abs(environmental.changePercentage), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      %
    </small>
  ) : null;

  const socialCapitalScore = socialCapital?.operationalDelaysLevel ?? "N/A";

  const humanCapitalScore = humanCapital?.changePercentage != null ? (
    <small className="flex items-center gap-2">
      <FaArrowDown
        className={`${humanCapital.changePercentage > 0 ? "rotate-180 text-red-500" : "text-green-500"}`}
      />
      {formatNumberFull(Math.abs(humanCapital.changePercentage), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      %
    </small>
  ) : null;

  const businessModelScore = businessModel?.changePercentage != null ? (
    <small className="flex items-center gap-2">
      <FaArrowDown
        className={`${businessModel.changePercentage > 0 ? "rotate-180 text-red-500" : "text-green-500"}`}
      />
      {formatNumberFull(Math.abs(businessModel.changePercentage), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      %
    </small>
  ) : null;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {productionCards.map((card) => (
            <OilRenderCard
              key={card.title}
              borderColor={card.borderColor}
              title={card.title}
              amount={card.amount}
              sub={card.sub}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
            environmental?.changePercentage != null
              ? `Total emissions ${environmental.changePercentage > 0 ? 'increased' : 'decreased'} by ${formatNumberShort(Math.abs(environmental.changePercentage))}% YoY.`
              : "On track to meet reduction targets." // A safe generic fallback if no previous data
          }
          icon={<FaLeaf />}
          iconBg={"#f1fcf4"}
          iconText={"#1e8a3d"}
          borderColor={"#1e8a3d"}
          scoreBg="#e5f5ec"
          scoreColor="#16a34a"
        />
        <EsgAssignmrntReportCard
          title={"Operational Delays"}
          pillar={"Social Capital"}
          score={socialCapitalScore}
          amount={`${formatNumberShort(socialCapital?.totalNumberOfIncidents ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} incidents`}
          footer={
            `${formatNumberShort(socialCapital?.totalNumberOfIncidents ?? 0)} incidents recorded. ${socialCapital?.operationalDelaysLevel || 'Low Risk'} observed.`
          }
          icon={<PiUsersFill />}
          iconBg={"#eff5ff"}
          iconText={"#2570eb"}
          borderColor={"#2570eb"}
          scoreColor="#2563eb"
        />
        <EsgAssignmrntReportCard
          title={"Total recordable incident rate"}
          pillar={"Human Capital"}
          score={humanCapitalScore}
          amount={`${formatNumberShort(humanCapital?.totalRecordableIncidentRatePer200kHours ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per 200k hrs`}
          footer={
            `Safety performance ${humanCapital?.changePercentage && humanCapital.changePercentage < 0 ? 'improved' : 'tracked'} YoY. ${humanCapital?.fatalities ?? 0} fatalities recorded.`
          }
          icon={<GiHumanPyramid />}
          iconBg={"#ECFDF5"}
          iconText={"#0D9488"}
          borderColor={"#0D9488"}
          scoreColor="#0D9488"
        />
        <EsgAssignmrntReportCard
          title={"Reserves at risk"}
          pillar={"Business Model"}
          score={businessModelScore}
          amount={`${formatNumberShort(businessModel?.totalReservesAmountAtRisk ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} bbl`}
          footer={
            `Strategic shift towards renewables. ${formatNumberShort(businessModel?.totalReservesAmountAtRisk ?? 0)} bbl reserves modeled at risk.`
          }
          icon={<GiHumanPyramid />}
          iconBg={"#f5e2ff"}
          iconText={"#af57db"}
          borderColor={"#af57db"}
          scoreColor="#7c3aed"
        />
        <EsgAssignmrntReportCard
          title={"Process safety"}
          pillar={"Leadership and Governance"}
          score={`${formatNumberFull(leadership?.processSafetyPercentage ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          amount={`${leadership?.numberOfTierEventsAndWhatTier ? formatNumberShort(Number(leadership.numberOfTierEventsAndWhatTier) || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "N/A"} per 200k hrs`}
          footer={`Sustainability oversight ${leadership?.managementOfLegalAndRegulatoryEnvironment?.sustainabilityGovernance === "yes" ? "active" : "needs attention"}. Process safety event rate at ${formatNumberFull(leadership?.processSafetyPercentage ?? 0, { maximumFractionDigits: 2 })} per 200k hrs.`}
          icon={<GiHumanPyramid />}
          iconBg={"#e8e8e8"}
          iconText={"#4a4a4a"}
          borderColor={"#4a4a4a"}
          scoreColor="#4b5563"
        />
      </div>
    </div>
  );
}
