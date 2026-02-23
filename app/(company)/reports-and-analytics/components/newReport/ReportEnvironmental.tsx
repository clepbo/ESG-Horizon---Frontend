import React from "react";
import { FaLeaf } from "react-icons/fa";
// import EnvironmentalEmissionCard from "./environmental/EnvironmentalEmissionCard";
import EmissionsChart from "./environmental/EmissionsChart";
import EmissionsByScope, { transformGHGData } from "./environmental/EmissionByScope";
import ReductionTarget from "./environmental/ReductionTarget";
import { IoWaterSharp } from "react-icons/io5";
import { MdAir } from "react-icons/md";
import OilRenderCard, { WaterQualityCard } from "./overview/OilRenderCard";
import PollutantEmissionChart from "./environmental/PollutantEmissionChart";
import EmissionDistributionChart from "./environmental/EmissionDistributionChart";
import ProducedWaterManagementChart from "./environmental/ProducedWaterManagementChart";
import { FreshWaterWithdrawalSource } from "./environmental/FreshWaterWithdrawalSource";
import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";
import { CustomProgressWithoutSections } from "../charts/ProgressBar";
import { FaSeedling } from "react-icons/fa6";
import ReserveInSensitiveAreasChart from "./environmental/ReserveInSensitiveAreasChart";
import { ReportResponse } from "@/types/report/reportResponse";
import ReductionTargetByScope from "./environmental/ReductionTargetByScope";
import { GHGHistoryTransformer } from "./environmental/GHGHistoryTransformer";
import { getYear } from "date-fns";
import Link from "next/link";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { formatNumberFull } from "@/lib/numberFormat";

interface ReportEnvironmentalProps {
  reportData?: ReportResponse;
}

export default function ReportEnvironmental({ reportData }: ReportEnvironmentalProps) {
  const airQuality = reportData?.environmental?.airQuality;
  const waterManagement = reportData?.environmental?.waterManagement;
  const bioDiversity = reportData?.environmental?.biodiversityImpact;
  const ghg = reportData?.environmental?.greenhouseGasEmission;
  const target = reportData?.targets;

  let scopeTarget = null;
  if (reportData?.targets && reportData?.targets?.scopeTargets !== undefined) {
    scopeTarget = reportData?.targets?.scopeTargets;
  }
  console.log("Report target Data", scopeTarget);

  const emissionData = GHGHistoryTransformer(ghg?.totalHistory || []);
  const emissionDataScope1 = GHGHistoryTransformer(ghg?.scope1History || []);
  const emissionDataScope2 = GHGHistoryTransformer(ghg?.scope2History || []);
  const emissionDataScope3 = GHGHistoryTransformer(ghg?.scope3History || []);

  // Build period string from report dates
  const assessmentPeriod =
    reportData?.startMonth && reportData?.endMonth
      ? `${reportData.startMonth} ${reportData.startYear} – ${reportData.endMonth} ${reportData.endYear}`
      : undefined;

  // Format a change value into display props (null = no previous data → hide badge)
  const formatChange = (change: number | null | undefined) => {
    if (change == null) return null;
    const abs = Math.abs(change);
    if (change < 0) {
      // Emissions decreased — good
      return { text: `${formatNumberFull(abs, { maximumFractionDigits: 1 })}%`, rotate: "", bg: "#dff9e6", color: "#16a34a" };
    }
    // Emissions increased — bad
    return { text: `${formatNumberFull(abs, { maximumFractionDigits: 1 })}%`, rotate: "180deg", bg: "#fee2e2", color: "#dc2626" };
  };

  const totalChangeProps = formatChange(ghg?.totalChange);
  const scope1ChangeProps = formatChange(ghg?.scope1Change);
  const scope2ChangeProps = formatChange(ghg?.scope2Change);
  const scope3ChangeProps = formatChange(ghg?.scope3Change);
  return (
    <div className="flex flex-col gap-4 lg:gap-20">
      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-[#dff9e6]">
            <FaLeaf className="text-primary rounded" />
          </span>
          <div className="flex flex-col">
            <h6 className="text-base font-semibold"> Greenhouse Gas Emissions </h6>
            <p className="text-sm text-gray-600">
              Scope 1, 2, and 3 emissions performance against targets
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <EmissionsChart
            borderColor="#1e8a3d"
            period={assessmentPeriod}
            value={
              ghg
                ? formatNumberFull(ghg.totalEmissions ?? 0, { minimumFractionDigits: 2 })
                : "0.00"
            }
            data={emissionData}
            {...(totalChangeProps && {
              change: totalChangeProps.text,
              bgColor: totalChangeProps.bg,
              color: totalChangeProps.color,
              rotateIcon: totalChangeProps.rotate,
            })}
          />
          <EmissionsChart
            borderColor="#2570eb"
            title="Scope 1"
            period={assessmentPeriod}
            value={
              ghg
                ? formatNumberFull(ghg.scope1Emissions ?? 0, { minimumFractionDigits: 2 })
                : "0.00"
            }
            data={emissionDataScope1}
            {...(scope1ChangeProps && {
              change: scope1ChangeProps.text,
              bgColor: scope1ChangeProps.bg,
              color: scope1ChangeProps.color,
              rotateIcon: scope1ChangeProps.rotate,
            })}
          />
          <EmissionsChart
            borderColor="#10B981"
            title="Scope 2"
            period={assessmentPeriod}
            value={
              ghg
                ? formatNumberFull(ghg.scope2Emissions ?? 0, { minimumFractionDigits: 2 })
                : "0.00"
            }
            data={emissionDataScope2}
            {...(scope2ChangeProps && {
              change: scope2ChangeProps.text,
              bgColor: scope2ChangeProps.bg,
              color: scope2ChangeProps.color,
              rotateIcon: scope2ChangeProps.rotate,
            })}
          />
          <EmissionsChart
            borderColor="#af57db"
            title="Scope 3"
            period={assessmentPeriod}
            value={
              ghg
                ? formatNumberFull(ghg.scope3Emissions ?? 0, { minimumFractionDigits: 2 })
                : "0.00"
            }
            data={emissionDataScope3}
            {...(scope3ChangeProps && {
              change: scope3ChangeProps.text,
              bgColor: scope3ChangeProps.bg,
              color: scope3ChangeProps.color,
              rotateIcon: scope3ChangeProps.rotate,
            })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="col-span-1 md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h6 className="p-4 font-semibold border-b border-gray-300"> Emissions by Scope </h6>
            <div className="p-4 flex-1 flex items-center justify-center">
              {ghg && <EmissionsByScope data={transformGHGData(ghg)} />}
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h6 className="p-4 font-semibold border-b border-gray-300">
              {" "}
              {target?.targetYear ? `${target.targetYear} ` : ""}Reduction Target{" "}
            </h6>
            <div className="p-4 flex-1">
              {reportData?.targets === undefined || reportData?.targets === null ? (
                <div className="p-4 flex flex-col gap-4 items-center justify-center h-full">
                  <p className="text-gray-700 text-center">
                    You have not set any target yet, click below to set a target
                  </p>
                  <Link href={"/kpis"} className="bg-primary text-white p-4 py-1 rounded-md">
                    Set target
                  </Link>
                </div>
              ) : reportData?.targets?.type === "GENERAL" ? (
                <ReductionTarget
                  percentage={target?.generalTarget?.reductionPercentage || 0}
                  targetValue={target?.generalTarget?.targetEmission || 0}
                  currentYear={getYear(new Date())}
                  targetYear={target?.targetYear || 0}
                  baselineEmission={target?.generalTarget?.baselineYearEmission || 0}
                  baselineYear={target?.baselineYear}
                  currentEmission={target?.generalTarget?.currentEmission || 0}
                />
              ) : (
                <ReductionTargetByScope
                  scope1percentage={
                    // reportData?.percentage_emission_summary?.scope1_emission_summary || 0
                    (scopeTarget && scopeTarget[0]?.reductionPercentage) || 0
                  }
                  scope1value={ghg?.scope1Emissions || 0}
                  scope2percentage={
                    // reportData?.percentage_emission_summary?.scope2_emission_summary || 0
                    (scopeTarget && scopeTarget[1]?.reductionPercentage) || 0
                  }
                  scope2value={ghg?.scope2Emissions || 0}
                  scope3percentage={
                    // reportData?.percentage_emission_summary?.scope3_emission_summary || 0
                    (scopeTarget && scopeTarget[2]?.reductionPercentage) || 0
                  }
                  scope3value={ghg?.scope3Emissions || 0}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-100">
            <MdAir className="text-blue-600 rounded-md" />
          </span>
          <div className="flex flex-col">
            <h6 className="text-base font-semibold"> Air Quality </h6>
            <p className="text-sm text-gray-600"> NOx, SOx, VOCs and PM10 emissions management </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OilRenderCard
            borderColor={"#1e8a3d"}
            title={"Total Air Pollutant Emission (t)"}
            sub={"tonnes"}
            amount={airQuality?.totalEmission || 0}
          />
          <OilRenderCard
            borderColor={"#2570eb"}
            title={"Oxides of Nitrogen (NOx)"}
            sub={"tonnes"}
            amount={airQuality?.nox || 0}
          />
          <OilRenderCard
            borderColor={"#6366F1"}
            title={"Oxides of Sulphur (SOx) "}
            sub={"tonnes"}
            amount={airQuality?.sox || 0}
          />
          <OilRenderCard
            borderColor={"#af57db"}
            title={"Volatile Organic Compounds (VOCs) "}
            sub={"tonnes"}
            amount={airQuality?.voc || 0}
          />
          <OilRenderCard
            borderColor={"#f64c4c"}
            title={"Particulate Matter (PM10) "}
            sub={"tonnes"}
            amount={airQuality?.pm10 || 0}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <PollutantEmissionChart
              NOx={airQuality?.nox ?? 0}
              SOx={airQuality?.sox ?? 0}
              VOCs={airQuality?.voc ?? 0}
              PM10={airQuality?.pm10 ?? 0}
            />
          </div>
          <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <EmissionDistributionChart
              NOx={airQuality?.nox ?? 0}
              SOx={airQuality?.sox ?? 0}
              VOCs={airQuality?.voc ?? 0}
              PM10={airQuality?.pm10 ?? 0}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-[#dff9e6]">
            <IoWaterSharp className="text-primary rounded-md" />
          </span>
          <div className="flex flex-col">
            <h6 className="text-base font-semibold"> Water & Wastewater Management </h6>
            <p className="text-sm text-gray-900 font-medium">
              {" "}
              Freshwater withdrawal, produced water recycling, and chemical disclosure{" "}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <OilRenderCard
            borderColor={"#0000"}
            title={"Total Water Withdrawal"}
            sub={"m²"}
            amount={waterManagement?.totalWaterWithdrawal || 0}
          />
          <OilRenderCard
            borderColor={"#0000"}
            title={"Total Water Consumed"}
            sub={"m²"}
            amount={waterManagement?.totalWaterConsumed || 0}
          />
          <OilRenderCard
            borderColor={"#0000"}
            title={"Total Produced Water Generated"}
            sub={"m²"}
            amount={waterManagement?.totalProducedWaterGenerated || 0}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <OilRenderCard
            borderColor={"#3d9f56"}
            title={"Recycled/Reused"}
            sub={"m²"}
            amount={waterManagement?.recycledWater || 0}
          />
          <OilRenderCard
            borderColor={"#14b8a6"}
            title={"Injected for Disposal"}
            sub={"m²"}
            amount={waterManagement?.injectedForDisposal || 0}
          />
          <OilRenderCard
            borderColor={"#eb6f70"}
            title={"Discharged to Surface"}
            sub={"m²"}
            amount={waterManagement?.dischargedToSurface || 0}
          />
          <OilRenderCard borderColor={"#119b95"} title={"Total Wells"} sub={"wells"} amount={0} />
          <OilRenderCard
            borderColor={"#2570eb"}
            title={"Wells with Public Disclosure"}
            sub={"wells"}
            amount={
              waterManagement?.hydraulicFracturingChemicalDisclosure?.wells
                ?.numberOfWellsWithPublicDisclosure || 0
            }
          />
          <OilRenderCard
            borderColor={"#af57db"}
            title={"Percentage with Disclosure"}
            sub={"%"}
            amount={
              waterManagement?.hydraulicFracturingChemicalDisclosure?.wells
                ?.percentageWithDisclosure || 0
            }
          />
          <OilRenderCard borderColor={"#f64c4c"} title={"Total Sites"} sub={"sites"} amount={0} />
          <OilRenderCard
            borderColor={"#1e8a3d"}
            title={"Sites with Deteriorated Water Quality"}
            sub={"sites"}
            amount={
              waterManagement?.hydraulicFracturingChemicalDisclosure?.sites
                ?.withDeterioratedWaterQuality || 0
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <FreshWaterWithdrawalSource
              surfaceWater={waterManagement?.freshwaterWithdrawalBySource?.surfaceWater || 0}
              groundwater={waterManagement?.freshwaterWithdrawalBySource?.groundwater || 0}
              municipal={waterManagement?.freshwaterWithdrawalBySource?.municipalWater || 0}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <ProducedWaterManagementChart
              recycled={waterManagement?.recycledWater || 0}
              injected={waterManagement?.injectedForDisposal || 0}
              discharged={waterManagement?.dischargedToSurface || 0}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 gap-2 flex flex-col">
            <span className="">
              <h6 className="p-4 "> Hydraulic Fracturing - Chemical Disclosure </h6>
              <hr className="text-gray-200" />
            </span>
            <div className="p-4 grid grid-cols-1 gap-4">
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                  <p className=""> Total Fractured Wells</p>
                  <p className="font-bold text-3xl">
                    {formatNumberFigures(
                      waterManagement?.hydraulicFracturingChemicalDisclosure?.wells
                        ?.totalFracturedWells || 0
                    )}
                    {/* {waterManagement?.hydraulicFracturingChemicalDisclosure?.wells
                      ?.totalFracturedWells || 0}{" "} */}
                  </p>
                </div>
                <CircularProgressbarWithChildren
                  className=" h-40 w-40"
                  // value={Number(
                  //   (
                  //     waterManagement?.hydraulicFracturingChemicalDisclosure?.wells
                  //       ?.percentageWithDisclosure || 0
                  //   ).toFixed(1) || 0
                  // )}
                  value={Number(formatNumberFull(
                    waterManagement?.hydraulicFracturingChemicalDisclosure?.wells
                      ?.percentageWithDisclosure ?? 0,
                    { maximumFractionDigits: 1 }
                  ))}
                  styles={buildStyles({ pathColor: "#119b95" })}
                >
                  <div
                    style={{ fontSize: 12, marginTop: -5 }}
                    className="flex text-xs flex-col items-center"
                  >
                    <strong>
                      {formatNumberFull(
                        waterManagement?.hydraulicFracturingChemicalDisclosure?.wells
                          ?.percentageWithDisclosure ?? 0,
                        { maximumFractionDigits: 2 }
                      )}
                      %
                    </strong>
                    <p className="font-thin">Disclosure Rate </p>
                    <p className="">
                      {formatNumberFull(
                        waterManagement?.hydraulicFracturingChemicalDisclosure?.wells
                          ?.percentageWithDisclosure ?? 0,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      Wells Disclosed
                    </p>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="bg-gray-100 p-2 py-4 rounded-md">
                <CustomProgressWithoutSections
                  value={
                    (waterManagement?.producedWater?.totalGenerated ?? 0) > 0
                      ? Math.round(
                          ((waterManagement?.hydraulicFracturing?.volumeRecycledReused ?? 0) /
                            (waterManagement?.producedWater?.totalGenerated ?? 1)) *
                            100
                        )
                      : (waterManagement?.hydraulicFracturing?.volumeRecycledReused ?? 0) > 0
                        ? 100
                        : 0
                  }
                  title="Volume Recycled/Reused"
                  total={waterManagement?.hydraulicFracturing?.volumeRecycledReused || 0}
                  unit="m³"
                  barColor="#119b95"
                  percent={
                    (waterManagement?.producedWater?.totalGenerated ?? 0) > 0
                      ? Math.round(
                          ((waterManagement?.hydraulicFracturing?.volumeRecycledReused ?? 0) /
                            (waterManagement?.producedWater?.totalGenerated ?? 1)) *
                            100
                        )
                      : 0
                  }
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 gap-2 flex flex-col">
            <span className="">
              <h6 className="p-4 ">Water Quality Impacts </h6>
              <hr className="text-gray-200" />
            </span>
            <div className="p-4 grid grid-cols-1 gap-4">
              <WaterQualityCard
                title={"Wells with public chemical disclosure"}
                amount={
                  waterManagement?.hydraulicFracturingChemicalDisclosure?.wells
                    ?.numberOfWellsWithPublicDisclosure || 0
                }
                progress={Number(
                  waterManagement?.hydraulicFracturingChemicalDisclosure?.wells?.percentageWithDisclosure?.toFixed(
                    2
                  ) || 0
                )}
              />
              <WaterQualityCard
                title={"Volume Recycled/Reused"}
                amount={waterManagement?.recycledWater || 0}
                progress={Number(
                  waterManagement?.hydraulicFracturingChemicalDisclosure?.wells?.percentageWithDisclosure?.toFixed(
                    2
                  ) || 0
                )}
                sub="m³"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-[#e2f6e7]">
            <FaSeedling className="text-[#308947] rounded-md" />
          </span>
          <div className="flex flex-col">
            <h6 className="text-base font-semibold"> Biodiversity Impacts </h6>
            <p className="text-sm text-gray-600">
              {" "}
              Spill management, sensitive area reserves, and environmental policies{" "}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 gap-2 flex flex-col">
            <span className="">
              <h6 className="p-3 "> Hydraulic Spills </h6>
              <hr className="text-gray-200" />
            </span>
            <div className="p-4 flex flex-col my-4 w-full gap-6 h-full">
              <div className="flex flex-col items-center justify-center text-sm">
                <p className="font-thin">Number of Spills</p>
                <p className="font-semibold text-3xl ml-4">
                  {bioDiversity?.hydrocarbonSpills?.numberOfSpills || 0}{" "}
                </p>
              </div>

              <CustomProgressWithoutSections
                value={
                  (bioDiversity?.hydrocarbonSpills?.totalVolumeSpilled ?? 0) > 0 ? 100 : 0
                }
                title="Total Volume Spilled"
                total={bioDiversity?.hydrocarbonSpills?.totalVolumeSpilled || 0}
                unit="bbl"
                barColor="bg-red-500"
                percent={100}
              />

              <CustomProgressWithoutSections
                value={
                  (bioDiversity?.hydrocarbonSpills?.totalVolumeSpilled ?? 0) > 0
                    ? Math.round(
                        ((bioDiversity?.hydrocarbonSpills?.volumeRecovered ?? 0) /
                          (bioDiversity?.hydrocarbonSpills?.totalVolumeSpilled ?? 1)) *
                          100
                      )
                    : 0
                }
                title="Volume Recovered"
                total={bioDiversity?.hydrocarbonSpills?.volumeRecovered || 0}
                unit="bbl"
                barColor="#3d9f56"
                percent={
                  (bioDiversity?.hydrocarbonSpills?.totalVolumeSpilled ?? 0) > 0
                    ? Math.round(
                        ((bioDiversity?.hydrocarbonSpills?.volumeRecovered ?? 0) /
                          (bioDiversity?.hydrocarbonSpills?.totalVolumeSpilled ?? 1)) *
                          100
                      )
                    : 0
                }
              />
            </div>
            <hr className="text-gray-200" />
            <div className="flex items-center justify-between align-middle h-full p-4">
              <div className="flex flex-col items-center gap-2 text-xs">
                <span className="font-thin"> Volume in Arctic </span>
                <span className="font-semibold text-2xl">
                  {bioDiversity?.hydrocarbonSpills?.volumeInArctic || 0} bbl{" "}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-xs">
                <span className="font-thin"> Sensitive Shorelines </span>
                <span className="font-semibold text-red-500 text-2xl">
                  {bioDiversity?.hydrocarbonSpills?.volumeImpactingSensitiveShorelines || 0}{" "}
                  bbl{" "}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 gap-2 flex flex-col">
            <span className="">
              <h6 className="p-3 "> Reserves in Sensitive Areas </h6>
              <hr className="text-gray-200" />
            </span>
            <div className="p-4 grid grid-cols-1 gap-4 justify-end align-bottom">
              <ReserveInSensitiveAreasChart
                provedTotal={bioDiversity?.reservesInSensitiveAreas?.provedReserves || 0}
                probableTotal={bioDiversity?.reservesInSensitiveAreas?.probableReserves || 0}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 gap-2 flex flex-col">
            <span className="">
              <h6 className="p-3 "> Management Policies </h6>
              <hr className="text-gray-200" />
            </span>
            <div className="p-4 grid grid-cols-1 gap-4">
              <p className="text-sm">
                {" "}
                Our environmental management system (EMS) is aligned with ISO 14001 standards. We
                prioritize the protection of biodiversity through rigorous risk assessments,
                avoidance of critical habitats, and implementation of robustspill prevention and
                esponse plans.{" "}
              </p>

              <p className="font-semibold">Key Practices:</p>
              <ul className="list-disc list-inside text-sm">
                <li> Pre-activity biodiversity surveys in all new project areas </li>
                <li> Zero-discharge policy in sensitive marine environments </li>
                <li> Integrated spill response drills with local communities </li>
              </ul>
              <hr className="text-gray-200" />
              <div className="flex w-full items-center justify-between ">
                <span className="font-semibold text-sm"> STANDARD: </span>
                <span className="bg-success-200 rounded-2xl text-green-400 p-2 py-1 text-sm">
                  {" "}
                  ISO 14001 Aligned{" "}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
