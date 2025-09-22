import HeadingAndSubheading from '@/app/components/common/reports/HeadingAndSubheading'
import React from 'react'
import Header from '../../components/Header'
import { DataTable } from '@/app/components/common/reports/table/DataTable'

export default function Report() {
  return (
    <div className=" py-4 gap-8 md:gap-16 md:py-8 px-8 bg-[#DFF9E6] w-full min-h-screen">
        <Header />
        <HeadingAndSubheading heading='Reports' subheading='Access comprehensive insights into your company’s ESG performance' />
        <div className="mt-4 md:mt-10">
          <DataTable />
        </div>
    </div>
  )
}
