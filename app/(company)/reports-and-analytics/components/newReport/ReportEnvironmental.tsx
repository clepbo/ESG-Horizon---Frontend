import React, { useEffect } from "react";
import { FaLeaf } from "react-icons/fa";
// import EnvironmentalEmissionCard from "./environmental/EnvironmentalEmissionCard";
import EmissionsChart from "./environmental/EmissionsChart";
import EmissionsByScope, { emissionByScopedata } from "./environmental/EmissionByScope";
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
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";
import { useParams } from "next/navigation";
import { ReportResponse } from "@/types/report/reportResponse";
import { useSingleReport } from "../service/useReport";
import { formatNumberWithCommas } from "../utils/helpers";

export default function ReportEnvironmental() {
  const [reportData, setReportData] = React.useState<ReportResponse | null>(null);
     
      const params = useParams();
        const { data, isError, isLoading } = useSingleReport(Number(params?.id));
    
        useEffect(()=> {
          setReportData(data);
        })

        const airQuality = reportData?.environment_details?.airQuality;
        const waterManagement = reportData?.environment_details?.waterManagement;
        const bioDiversity = reportData?.environment_details?.biodiversityImpacts;
    
        // console.log("ReportOverview Data", bioDiversity);
        
        if (isError) {  
          return (
            <div className="w-full flex justify-center items-center py-12 text-red-500">
              Failed to load report.
            </div>
          );
        }
        if( isLoading ) {
          return (
            <div className="w-full flex justify-center items-center py-12 text-gray-500">
              <CardSkeleton />
            </div>
          );
        }
        if (!data || data === undefined || data === null || Object.keys(data).length === 0) {
          return (
            <div className="w-full flex justify-center items-center py-12 text-gray-600">
              No data
            </div>
          );
        }
        
        // const emissionScopeData = reportData?.
  return (
    <div className="flex flex-col gap-4 lg:gap-20">
      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-[#dff9e6]">
            <FaLeaf className="text-primary rounded" />
          </span>
          <div className="flex flex-col">
            <h6 className="text-sm"> Greenhouse Gas Emissions </h6>
            <p className="text-xs text-gray-600">
              Scope 1, 2, and 3 emissions performance against targets{" "}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <EmissionsChart borderColor="#1e8a3d" bgColor="#dff9e6" color="#84bb94" value={formatNumberWithCommas(reportData?.summary?.startMonth?.environment?.totalEmission ?? 0)} />
          <EmissionsChart borderColor="#2570eb" bgColor="#dff9e6" title="Scope 1" value={formatNumberWithCommas(reportData?.summary?.startMonth?.environment?.ghg?.scope1?.totalEmission ?? 0)} color="#84bb94" />
          <EmissionsChart borderColor="#fac565" bgColor="#dff9e6" title="Scope 2" value={formatNumberWithCommas(reportData?.summary?.startMonth?.environment?.ghg?.scope2?.totalEmission ?? 0)} color="#84bb94" />
          <EmissionsChart borderColor="#af57db" bgColor="#dff9e6" title="Scope 3" value={formatNumberWithCommas(reportData?.summary?.startMonth?.environment?.ghg?.scope3?.totalEmission ?? 0)} color="#84bb94" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 rounded-2xl shadow p-2">
            <EmissionsByScope data={emissionByScopedata} />
          </div>
          <div className="col-span-1 rounded-2xl shadow">
            <ReductionTarget />
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-100">
            <MdAir className="text-blue-600 rounded-md" />
          </span>
          <div className="flex flex-col">
            <h6 className="text-sm"> Air Quality </h6>
            <p className="text-xs text-gray-600"> NOx, SOx,VOCs and PM10 emissions managememnt </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OilRenderCard
            borderColor={"#1e8a3d"}
            title={"Total Air Pollutant Emission (t)"}
            sub={"tonnes"}
            amount={airQuality?.totalAirPollutantEmission || 0}
          />
          <OilRenderCard
            borderColor={"#2570eb"}
            title={"Oxides of Nitrogen (NOx)"}
            sub={"tonnes"}
            amount={airQuality?.nox || 0}
          />
          <OilRenderCard
            borderColor={"#dca54b"}
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
            amount={airQuality?.pm || 0}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 rounded-2xl shadow p-3">
            <PollutantEmissionChart NOx={airQuality?.nox ?? 0} SOx={airQuality?.sox ?? 0 } VOCs={airQuality?.voc ?? 0} PM10={airQuality?.pm ?? 0} />
          </div>
          <div className="col-span-1 rounded-2xl shadow p-3">
            <EmissionDistributionChart NOx={airQuality?.nox ?? 0} SOx={airQuality?.sox ?? 0 } VOCs={airQuality?.voc ?? 0} PM10={airQuality?.pm ?? 0} />
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-[#dff9e6]">
            <IoWaterSharp className="text-primary rounded-md" />
          </span>
          <div className="flex flex-col">
            <h6 className="text-sm"> Water && Wastewater Management </h6>
            <p className="text-xs text-gray-600">
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
            amount={waterManagement?.recycledReused || 0}
          />
          <OilRenderCard
            borderColor={"#f9b232"}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 rounded-2xl shadow p-3">
            <FreshWaterWithdrawalSource municipal={0} groundwater={0} surfaceWater={0} />
          </div>
          <div className="col-span-1 rounded-2xl shadow p-3">
            <ProducedWaterManagementChart recycled={waterManagement?.recycledReused || 0} 
            injected={waterManagement?.injectedForDisposal || 0} discharged={waterManagement?.dischargedToSurface || 0} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl shadow gap-2 flex flex-col">
            <span className="">
              <h6 className="p-4 "> Hydraulic Fracturing - Chemical Disclosure </h6>
              <hr className="text-gray-200" />
            </span>
            <div className="p-4 grid grid-cols-1 gap-4">
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                  <p className=""> Total Fractured Wells</p>
                  <p className="font-bold"> {waterManagement?.hydraulicFracturing?.totalFracturedWells || 0} </p>
                </div>
                <CircularProgressbarWithChildren
                  className=" h-40 w-40"
                  value={51}
                  // styles={buildStyles({ pathColor: progress > 50 ? "green" : "red", })}
                  styles={buildStyles({ pathColor: "#119b95" })}
                >
                  <div
                    style={{ fontSize: 12, marginTop: -5 }}
                    className="flex text-xs flex-col items-center"
                  >
                    <strong>{51}%</strong>
                    <p className="font-thin">Disclosure Rate </p>
                    <p className=""> 72 Wells Disclosed</p>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="bg-gray-100 p-2 py-4 rounded-md">
                {/* <CustomProgressWithoutSections percent={51} title="Volume Recycled/Reused" value={30} total={4500} unit="m" className="" /> */}
                <CustomProgressWithoutSections
                  value={70}
                  title="Volume Recycled/Reused"
                  total={9300}
                  unit="m"
                  barColor=""
                  percent={70}
                />
              </div>
            </div>
          </div>
          <div className="rounded-2xl shadow gap-2 flex flex-col">
            <span className="">
              <h6 className="p-4 ">Water Quality Impacts </h6>
              <hr className="text-gray-200" />
            </span>
            <div className="p-4 grid grid-cols-1 gap-4">
              <WaterQualityCard
                title={"Wells with public chemical disclosure"}
                amount={45}
                progress={48}
              />
              <WaterQualityCard title={"Volume ecycled/Reused"} amount={65} progress={67} sub="m" />
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
            <h6 className="text-sm"> Biodiversity Impacts </h6>
            <p className="text-xs text-gray-600">
              {" "}
              Spill anagement, ensitive areareserves, and environmental policies{" "}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl shadow gap-2 flex flex-col">
            <span className="">
              <h6 className="p-3 "> Hydraulic Spills </h6>
              <hr className="text-gray-200" />
            </span>
            <div className="p-4 flex flex-col my-20 w-full gap-6 h-full">
              <div className="flex flex-col items-center justify-center text-sm">
                <p className="font-thin">Number of Spills</p>
                <p className="font-semibold text-3xl ml-4">{bioDiversity?.hydrocarbonSpills?.numberOfSpills || 0} </p>
              </div>

              <CustomProgressWithoutSections
                value={100}
                title="Total Volume Spilled"
                total={bioDiversity?.hydrocarbonSpills?.totalVolumeSpilled || 0}
                unit="bbl"
                barColor="bg-red-500"
                percent={100}
              />

              <CustomProgressWithoutSections
                value={88}
                title="Volume Recovered"
                total={bioDiversity?.hydrocarbonSpills?.volumeRecovered || 0}
                unit="bbl"
                barColor="#3d9f56"
                percent={88}
              />
            </div>
            <hr className="text-gray-200" />
            <div className="flex items-center justify-between align-middle h-full p-4">
              <div className="flex flex-col items-center gap-2 text-xs">
                <span className="font-thin"> Volume in Arctic </span>
                <span className="font-semibold text-2xl">{bioDiversity?.volumeInArctic} bbl </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-xs">
                <span className="font-thin"> Sensitive Shorelines </span>
                <span className="font-semibold text-[#d48c3b] text-2xl">{0} bbl </span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl shadow gap-2 flex flex-col">
            <span className="">
              <h6 className="p-3 "> Reserves in Sensitive Areas </h6>
              <hr className="text-gray-200" />
            </span>
            <div className="p-4 grid grid-cols-1 gap-4 justify-end align-bottom">
              <ReserveInSensitiveAreasChart provedTotal={bioDiversity?.reservesInSensitiveAreas?.proved || 0} 
              probableTotal={bioDiversity?.reservesInSensitiveAreas?.probable || 0} />
            </div>
          </div>
          <div className="rounded-2xl shadow gap-2 flex flex-col">
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
