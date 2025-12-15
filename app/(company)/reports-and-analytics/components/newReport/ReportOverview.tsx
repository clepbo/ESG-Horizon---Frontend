import ComingSoon from '@/app/components/coming-soon'
import React from 'react'
import { CiWavePulse1 } from "react-icons/ci";
import OilRenderCard, { cardData } from './overview/OilRenderCard';
import ProductionVolumesChart from './overview/oilProductionChart';
import DonutChart from './overview/DonoghtChart';
import { FaSeedling } from 'react-icons/fa';
import EsgAssignmrntReportCard from './overview/EsgAssignmrntReportCard';


export default function ReportOverview() {
  return (
    <div className='flex flex-col gap-4 lg:gap-10'>
      <div className="flex items-center gap-2">
        <span className='p-2 bg-[#CDFAF3]'>
          <CiWavePulse1 className='text-primary rounded' />
        </span>
        <div className='flex flex-col'>
          <h6 className='text-sm'> Activity metrics</h6>
          <text className='text-xs text-gray-600'> Production Data and Asset Portfolio</text>
        </div>
      </div>

      <div className="">

        <h5 className=' border-b w-full border-gray-400 text-gray-700'>
          Production Data
        </h5>
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-3 mt-3">
          <div className="col-span-2">
            <ProductionVolumesChart />
          </div>
          <div className='flex flex-col gap-2 lg:gap-4'>
            {
              cardData.map((card) => {
                return (
                  <OilRenderCard key={card.title}
                    borderColor={card.borderColor}
                    title={card.title}
                    amount={card.amount}
                    sub={card.sub} />
                )
              })
            }
          </div>
        </div>
      </div>



      <div className="">

        <h5 className=' border-b w-full border-gray-400 text-gray-700 '>
          Asset portfolio
        </h5>
        <div className="grid grid-cols-1 items-start md:grid-cols-2 mt-6">
          <span className='max-w-sm'>

            <OilRenderCard borderColor={'#0000'} title={'Total Number of Offshore Sites'} sub={'sites'} amount={23} />
          </span>
          <span className='max-w-sm'>

            <OilRenderCard borderColor={'#0000'} title={'Total Number of Offshore Sites'} sub={'sites'} amount={23} />
          </span>

        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
        <span className='col-span-1'>

          <DonutChart
            data={[
              { name: "Production Platforms", value: 470, color: "#3b82f6" },
              { name: "FPSOs", value: 120, color: "#22c55e" },
              { name: "Other Offshore Sites", value: 80, color: "#9ca3af" },
            ]}
          />
        </span>
        <span className='col-span-1'>

          <DonutChart
            title='Terrestial Sites'
            data={[
              { name: "Flow Stations", value: 470, color: "#f64c4c" },
              { name: "Gas Proseccing Plants", value: 120, color: "#af57db" },
              { name: "Other Sites", value: 80, color: "#9ca3af" }
            ]}
          />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className='p-2 bg-gray-300'>
          <FaSeedling className='text-gray-600 rounded' />
        </span>
        <div className='flex flex-col'>
          <h6 className='text-sm'> ESG Assessment Report </h6>
          <text className='text-xs text-gray-600'> Environmental, Social Capital, Human Capital, Business Model, and Leadership & Governance </text>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <EsgAssignmrntReportCard />
            <EsgAssignmrntReportCard />
            <EsgAssignmrntReportCard />
            <EsgAssignmrntReportCard />
            <EsgAssignmrntReportCard />
      </div>

    </div>
  )
}
