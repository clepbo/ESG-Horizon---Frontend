import React from 'react'
import { DataTable } from '@/app/components/common/reports/table/DataTable'

export default function Report() {
  return (
    <div className=" py-4 gap-8 md:gap-16 md:py-8 bg-[#DFF9E6] w-full min-h-screen">
        
        <div className="mt-4 md:mt-10">
          <DataTable />
        </div>
       
    </div>
  )
}
